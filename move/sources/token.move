// Copyright (c) Daniel Porteous
// SPDX-License-Identifier: Apache-2.0

//! See the README for more information about how this module works.
//!
//! In this module we intentionally do not emit events. The only real reason to emit
//! events is for the sake of indexing, but we can just process the writesets for that.

// todo idk whether to use vector or smart vector

// note, the plan for now is to have the collection be unlimited and allow anyone to
// mint, with the idea being that canvases should have value themselves rather than
// value through scarcity. perhaps a phase 2 release could be limited? who knows.

// this module could really benefit from allowing arbitrary drop structs as arguments
// to entry functions, e.g. CanvasConfig, Coords, Color, etc.

module addr::canvas_token {
    use addr::canvas_collection::{get_collection, get_collection_name};
    use std::error;
    use std::option::{Self, Option};
    use std::signer;
    use std::string::String;
    use std::vector;
    use std::timestamp::now_seconds;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin::Self;
    use aptos_std::object::{Self, ExtendRef, Object};
    use aptos_std::string_utils::format2;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_token_objects::collection::Self;
    use aptos_token_objects::token::Self;
    use dport_std::simple_set::{Self, SimpleSet};

    /// `default_color` was not in the palette.
    const E_CREATION_INITIAL_COLOR_NOT_IN_PALETTE: u64 = 1;

    /// The caller tried to draw outside the bounds of the canvas.
    const E_COORDINATE_OUT_OF_BOUNDS: u64 = 2;

    /// The caller tried to call a function that requires super admin privileges
    /// but they're not the super admin (the owner) or there is no super admin
    /// at all (as per owner_is_super_admin).
    const E_CALLER_NOT_SUPER_ADMIN: u64 = 3;

    /// The caller tried to call a function that requires admin privileges
    /// but they're not an admin / there are no admins at all.
    const E_CALLER_NOT_ADMIN: u64 = 4;

    /// The caller tried to draw a pixel but the canvas is no longer open for new
    /// contributions, and never will be, as per `can_draw_for_s`.
    const E_CANVAS_CLOSED: u64 = 5;

    /// The caller tried to draw a pixel but they contributed too recently based on
    /// the configured `per_account_timeout_s`. They must try again later.
    const E_MUST_WAIT: u64 = 6;

    /// The caller is not allowe to contribute to the canvas.
    const E_CALLER_IN_BLOCKLIST: u64 = 7;

    /// The caller is not in the allowlist for contributing to the canvas.
    const E_CALLER_NOT_IN_ALLOWLIST: u64 = 8;

    /// Based on the allowlist and/or blocklist (or lack thereof), the caller is
    /// allowed to contribute to the canvas.
    const STATUS_ALLOWED: u8 = 1;

    /// The caller is in the blocklist and is not allowed to contribute to the canvas.
    const STATUS_IN_BLOCKLIST: u8 = 2;

    /// The caller is not in the allowlist and is therefore not allowed to contribute
    /// to the canvas.
    const STATUS_NOT_IN_ALLOWLIST: u8 = 3;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct Canvas has key {
        /// The parameters used to configure default creation of the canvas.
        config: CanvasConfig,

        /// The pixels of the canvas.
        pixels: vector<Color>,

        /// When each artist last contributed. Only tracked if
        /// per_account_timeout_s is non-zero.
        last_contribution_s: SmartTable<address, u64>,

        /// Accounts that are allowed to contribute. If empty, anyone can contribute.
        /// One notable application of this list is the owner of the canvas, if
        /// owner_is_super_admin is true, can set just their own address here to
        /// effectively lock the canvas.
        allowlisted_artists: SimpleSet<address>,

        /// Accounts that are not allowed to contribute.
        blocklisted_artists: SimpleSet<address>,

        /// Accounts that have admin privileges. It is only possible to have admins if
        /// there is a super admin.
        admins: SimpleSet<address>,

        /// We use this to generate a signer, which we need for
        /// `clear_contribution_timeouts`.
        extend_ref: ExtendRef,

        /// When the canvas was created.
        created_at_s: u64,
    }

    struct CanvasConfig has store, drop {
        /// The width of the canvas.
        width: u64,

        /// The width of the canvas.
        height: u64,

        /// How long artists have to wait between contributions. If zero, when
        /// artists contribute is not tracked.
        per_account_timeout_s: u64,

        /// If non-zero, it will only be possible to draw on the canvas for this long,
        /// after which the canvas will be irrevocably locked forever.
        can_draw_for_s: u64,

        /// Allowed colors. If empty, all colors are allowed.
        palette: vector<Color>,

        /// How much it costs in OCTA to contribute.
        cost: u64,

        /// If a cost is set, this is where the funds are sent. If not set, funds will
        /// go to the owner of the token.
        funds_recipient: Option<address>,

        /// The default color of the pixels. If a paletter is set, this color must be a
        /// part of the palette.
        default_color: Color,

        /// Whether the owner of the canvas has super admin privileges. Super admin
        /// powers are the same as normal admin powers but in addition you have the
        /// ability to add / remove additional admins. Set at creation time and can
        /// never be changed.
        owner_is_super_admin: bool,
    }

    struct Color has copy, drop, store {
        r: u8,
        g: u8,
        b: u8,
    }

    /// Create a new canvas.
    public entry fun create(
        caller: &signer,
        // Arguments for the token + object.
        description: String,
        name: String,
        // Arguments for the canvas. For now we don't allow setting the palette
        // because it is a pain to express vector<Color> in an entry function.
        width: u64,
        height: u64,
        per_account_timeout_s: u64,
        can_draw_for_s: u64,
        cost: u64,
        // todo this doesn't work with the CLI but should work with the TS SDK
        // funds_recipient: Option<address>,
        default_color_r: u8,
        default_color_g: u8,
        default_color_b: u8,
        owner_is_super_admin: bool,
    ) {
        let config = CanvasConfig {
            width,
            height,
            per_account_timeout_s,
            can_draw_for_s,
            palette: vector::empty(),
            cost,
            funds_recipient: option::none(),
            default_color: Color {
                r: default_color_r,
                g: default_color_g,
                b: default_color_b,
            },
            owner_is_super_admin,
        };
        create_(caller, description, name, config);
    }

    /// This function is separate from the top level create function so we can use it
    /// in tests. This is necessary because entry functions (correctly) cannot return
    /// anything but we need it to return the object with the canvas in it. They also
    /// cannot take in struct arguments, which again is convenient for testing.
    public fun create_(
        caller: &signer,
        description: String,
        name: String,
        config: CanvasConfig,
    ): Object<Canvas> {
        // If a palette is given, assert it contains the default color.
        if (!vector::is_empty(&config.palette)) {
            assert!(
                vector::contains(&config.palette, &config.default_color),
                error::invalid_argument(E_CREATION_INITIAL_COLOR_NOT_IN_PALETTE),
            );
        };

        // Get the collection, which we need to build the URI.
        let collection = get_collection();

        // Build the URI, for example: https://canvas.dport.me/view/0x123
        let uri = format2(
            &b"{}/view/{}",
            collection::uri(collection),
            object::object_address(&collection),
        );

        // Create the token. This creates an ObjectCore and Token.
        // TODO: Use token::create when AUIDs are enabled.
        let constructor_ref = token::create_from_account(
            caller,
            get_collection_name(),
            description,
            name,
            option::none(),
            uri,
        );

        // Create the pixels.
        // TODO: There has to be a faster way than this.
        let pixels = vector::empty();
        let i = 0;
        while (i < config.width * config.height) {
            vector::push_back(&mut pixels, config.default_color);
            i = i + 1;
        };

        // Create the canvas.
        let canvas = Canvas {
            config,
            pixels,
            last_contribution_s: smart_table::new(),
            allowlisted_artists: simple_set::create(),
            blocklisted_artists: simple_set::create(),
            admins: simple_set::create(),
            extend_ref: object::generate_extend_ref(&constructor_ref),
            created_at_s: now_seconds(),
        };

        let object_signer = object::generate_signer(&constructor_ref);

        // Move the canvas resource into the object.
        move_to(&object_signer, canvas);

        object::object_from_constructor_ref(&constructor_ref)
    }

    /// Draw a pixel to the canvas. We consider the top left corner 0,0.
    public entry fun draw(
        caller: &signer,
        canvas: Object<Canvas>,
        x: u64,
        y: u64,
        r: u8,
        g: u8,
        b: u8,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        let canvas_owner_addr = object::owner(canvas);

        // Make sure the caller is allowed to draw.
        assert_allowlisted_to_draw(canvas, caller_addr);

        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));

        // If `can_draw_for_s` is non-zero, confirm that the canvas is still open.
        if (canvas_.config.can_draw_for_s > 0) {
            let now = now_seconds();
            assert!(
                now <= (canvas_.created_at_s + canvas_.config.can_draw_for_s),
                error::invalid_state(E_CANVAS_CLOSED),
            );
        };

        // Confirm the coordinates are not out of bounds.
        assert!(x < canvas_.config.width, error::invalid_argument(E_COORDINATE_OUT_OF_BOUNDS));
        assert!(y < canvas_.config.height, error::invalid_argument(E_COORDINATE_OUT_OF_BOUNDS));

        // If there is a cost, transfer the funds.
        if (canvas_.config.cost > 0) {
            let recipient = option::borrow_with_default(
                &canvas_.config.funds_recipient,
                &canvas_owner_addr,
            );
            coin::transfer<AptosCoin>(caller, *recipient, canvas_.config.cost);
        };

        // If there is a per-account timeout, first confirm that the caller is allowed
        // to write a pixel, and if so, update their last contribution time.
        if (canvas_.config.per_account_timeout_s > 0) {
            let now = now_seconds();
            if (smart_table::contains(&canvas_.last_contribution_s, caller_addr)) {
                let last_contribution = smart_table::borrow(&canvas_.last_contribution_s, caller_addr);
                assert!(
                    now > (*last_contribution + canvas_.config.per_account_timeout_s),
                    error::invalid_state(E_MUST_WAIT),
                );
                *smart_table::borrow_mut(&mut canvas_.last_contribution_s, caller_addr) = now;
            } else {
                smart_table::add(&mut canvas_.last_contribution_s, caller_addr, now);
            };
        };

        // Write the pixel.
        let color = Color { r, g, b };
        let index = y * canvas_.config.width + x;
        *vector::borrow_mut(&mut canvas_.pixels, index) = color;
    }

    fun assert_allowlisted_to_draw(canvas: Object<Canvas>, caller_addr: address) acquires Canvas {
        let status = allowlisted_to_draw(canvas, caller_addr);

        if (status == STATUS_IN_BLOCKLIST) {
            assert!(false, error::invalid_state(E_CALLER_IN_BLOCKLIST));
        };

        if (status == STATUS_NOT_IN_ALLOWLIST) {
            assert!(false, error::invalid_state(E_CALLER_NOT_IN_ALLOWLIST));
        };
    }

    #[view]
    /// Check whether the caller is allowed to draw to the canvas. Returns one of the
    /// STATUS_* constants.
    public fun allowlisted_to_draw(canvas: Object<Canvas>, caller_addr: address): u8 acquires Canvas {
        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));

        // Check the blocklist.
        if (simple_set::length(&canvas_.blocklisted_artists) > 0) {
            if (simple_set::contains(&canvas_.blocklisted_artists, &caller_addr)) {
                return STATUS_IN_BLOCKLIST
            };
        };

        // Check the allowlist.
        if (simple_set::length(&canvas_.allowlisted_artists) > 0) {
            if (!simple_set::contains(&canvas_.allowlisted_artists, &caller_addr)) {
                return STATUS_NOT_IN_ALLOWLIST
            };
        };

        STATUS_ALLOWED
    }

    ///////////////////////////////////////////////////////////////////////////////////
    //                                  Super admin                                  //
    ///////////////////////////////////////////////////////////////////////////////////

    public entry fun add_admin(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_super_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        simple_set::insert(&mut canvas_.admins, addr);
    }

    public entry fun remove_admin(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_super_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        simple_set::remove(&mut canvas_.admins, &addr);
    }

    fun assert_is_super_admin(canvas: Object<Canvas>, caller_addr: address) acquires Canvas {
        assert!(is_super_admin(canvas, caller_addr), error::invalid_state(E_CALLER_NOT_SUPER_ADMIN));
    }

    /// Set what account receives the funds. Does nothing if `cost` is zero.
    public entry fun set_funds_recipient(
        caller: &signer,
        canvas: Object<Canvas>,
        recipient: Option<address>,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_super_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        canvas_.config.funds_recipient = recipient;
    }

    /// If `last_contribution_s` is non-zero the Canvas tracks when users contributed.
    /// Over time this table will get quite large. By calling this function the super
    /// admin can completely wipe the table, likely getting a nice little storage refund.
    /// Naturally this might let people contribute sooner than they were meant to be
    /// able to, but this is really the only viable approach since there is no way to
    /// iterate through the table from within a Move function. Anyway, occasionally
    /// letting someone draw more often than intended is not a big deal.
    public entry fun clear_contribution_timeouts(
        caller: &signer,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        // TODO: This approach with moving out and back is sorta messy. If smart_table
        // had a method that took &mut this wouldn't be necessary.
        let caller_addr = signer::address_of(caller);
        assert_is_super_admin(canvas, caller_addr);
        let old_canvas_ = move_from<Canvas>(object::object_address(&canvas));
        let Canvas {
            config,
            pixels,
            last_contribution_s,
            allowlisted_artists,
            blocklisted_artists,
            admins,
            extend_ref,
            created_at_s,
        } = old_canvas_;
        let object_signer = object::generate_signer_for_extending(&extend_ref);
        let new_canvas_ = Canvas {
            config,
            pixels,
            last_contribution_s: smart_table::new(),
            allowlisted_artists,
            blocklisted_artists,
            admins,
            extend_ref,
            created_at_s,
        };
        move_to(&object_signer, new_canvas_);
        smart_table::destroy(last_contribution_s);
    }

    #[view]
    /// Check whether the caller is the super admin (if there is one at all).
    public fun is_super_admin(canvas: Object<Canvas>, caller_addr: address): bool acquires Canvas {
        let is_owner = object::is_owner(canvas, caller_addr);
        if (!is_owner) {
            return false
        };

        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));

        if (!canvas_.config.owner_is_super_admin) {
            return false
        };

        true
    }

    ///////////////////////////////////////////////////////////////////////////////////
    //                                     Admin                                     //
    ///////////////////////////////////////////////////////////////////////////////////

    public entry fun add_to_allowlist(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        simple_set::insert(&mut canvas_.allowlisted_artists, addr);
    }

    public entry fun remove_from_allowlist(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        simple_set::remove(&mut canvas_.allowlisted_artists, &addr);
    }

    public entry fun add_to_blocklist(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        simple_set::insert(&mut canvas_.blocklisted_artists, addr);
    }

    public entry fun remove_from_blocklist(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        simple_set::remove(&mut canvas_.blocklisted_artists, &addr);
    }

    public entry fun clear(
        caller: &signer,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        let i = 0;
        while (i < canvas_.config.width * canvas_.config.height) {
            *vector::borrow_mut(&mut canvas_.pixels, (i as u64)) = canvas_.config.default_color;
            i = i + 1;
        };
    }

    fun assert_is_admin(canvas: Object<Canvas>, caller_addr: address) acquires Canvas {
        assert!(is_admin(canvas, caller_addr), error::invalid_state(E_CALLER_NOT_ADMIN));
    }

    #[view]
    /// Check whether the caller is an admin (if there are any at all). We also check
    /// if they're the super admin, since that's a higher privilege level.
    public fun is_admin(canvas: Object<Canvas>, caller_addr: address): bool acquires Canvas {
        if (is_super_admin(canvas, caller_addr)) {
            return true
        };

        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));
        simple_set::contains(&canvas_.admins, &caller_addr)
    }

    ///////////////////////////////////////////////////////////////////////////////////
    //                                     Tests                                     //
    ///////////////////////////////////////////////////////////////////////////////////

    #[test_only]
    use addr::canvas_collection::{create as create_canvas_collection};
    #[test_only]
    use std::string;
    #[test_only]
    use std::timestamp;
    #[test_only]
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    #[test_only]
    use aptos_framework::account::{Self};
    #[test_only]
    use aptos_framework::coin;

    #[test_only]
    const ONE_APT: u64 = 100000000;

    #[test_only]
    const STARTING_BALANCE: u64 = 50 * 100000000;

    #[test_only]
    /// Create a test account with some funds.
    fun create_test_account(
        aptos_framework: &signer,
        account: &signer,
    ) {
        if (!aptos_coin::has_mint_capability(aptos_framework)) {
            // If aptos_framework doesn't have the mint cap it means we need to do some
            // initialization. This function will initialize AptosCoin and store the
            // mint cap in aptos_framwork. These capabilities that are returned from the
            // function are just copies. We don't need them since we use aptos_coin::mint
            // to mint coins, which uses the mint cap from the MintCapStore on
            // aptos_framework. So we burn them.
            let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
            coin::destroy_burn_cap(burn_cap);
            coin::destroy_mint_cap(mint_cap);
        };
        account::create_account_for_test(signer::address_of(account));
        coin::register<AptosCoin>(account);
        aptos_coin::mint(aptos_framework, signer::address_of(account), STARTING_BALANCE);
    }

    #[test_only]
    public fun set_global_time(
        aptos_framework: &signer,
        timestamp: u64
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test_secs(timestamp);
    }

    #[test_only]
    fun create_canvas(caller: &signer, friend1: &signer, friend2: &signer, aptos_framework: &signer): Object<Canvas> {
        set_global_time(aptos_framework, 100);

        create_test_account(aptos_framework, caller);
        create_test_account(aptos_framework, friend1);
        create_test_account(aptos_framework, friend2);

        let config = CanvasConfig {
            width: 50,
            height: 50,
            per_account_timeout_s: 0,
            palette: vector::empty(),
            cost: 0,
            default_color: Color {
                r: 0,
                g: 0,
                b: 0,
            },
            owner_is_super_admin: false,
        };

        create_(caller, string::utf8(b"description"), string::utf8(b"name"), config)
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_create(caller: signer, friend1: signer, friend2: signer, aptos_framework: signer) {
        create_canvas_collection(&caller);
        create_canvas(&caller, &friend1, &friend2, &aptos_framework);
    }
}
