// Copyright (c) Aptos Labs
// SPDX-License-Identifier: Apache-2.0

//! See the README for more information about how this module works.
//!
//! In this module we intentionally do not emit events. The only real reason to emit
//! events is for the sake of indexing, but we can just process the writesets for that.

// this module could really benefit from allowing arbitrary drop structs as arguments
// to entry functions, e.g. CanvasConfig, Coords, Color, etc.

module addr::canvas_token {
    use addr::canvas_collection::{
        get_collection,
        get_collection_name,
        is_owner as is_owner_of_collection,
        get_max_canvas_dimension,
    };
    use std::error;
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::timestamp::now_seconds;
    use aptos_framework::chain_id::{get as get_chain_id};
    use aptos_std::math64;
    use aptos_std::object::{Self, ExtendRef, Object};
    use aptos_std::string_utils;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_token_objects::token::{Self, MutatorRef};
    use dport_std::simple_set::{Self, SimpleSet};
    use addr::paint_fungible_asset;

    /// `default_color` was not in the palette.
    const E_CREATION_INITIAL_COLOR_NOT_IN_PALETTE: u64 = 1;

    /// `cost_multiplier` was less than 1.
    const E_CREATION_COST_MULTIPLIER_TOO_LOW: u64 = 10;

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

    /// Vectors provided to draw were of different lengths.
    const E_INVALID_VECTOR_LENGTHS: u64 = 9;

    /// The caller tried to call a function that requires collection owner privileges.
    const E_CALLER_NOT_COLLECTION_OWNER: u64 = 10;

    /// The caller exceeds the max number of pixels per draw.
    const E_EXCEED_MAX_NUMBER_OF_PIXELS_PER_DRAW: u64 = 11;

    /// Drawing disabled for non admin.
    const E_DRAW_DISABLED_FOR_NON_ADMIN: u64 = 12;

    /// Cannot create canvas that is larger than the allowed dimesion set in canvas collection.
    const E_CANVAS_EXCEEDED_MAX_ALLOWED_DIMENSIONS: u64 = 13;

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
        pixels: SmartTable<u64, Pixel>,

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

        /// When the canvas was created.
        created_at_s: u64,

        /// We use this to generate a signer, which we need for
        /// `clear_contribution_timeouts`.
        extend_ref: ExtendRef,

        /// We need this so the collection owner can update the URI if necessary.
        mutator_ref: MutatorRef,
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

        /// How much it costs in PNT to draw a single pixel. This is the base cost, which
        /// can be modified by some factor based on how recently the pixel was drawn.
        /// If zero, there is no cost. PNT has two decimal places, so to spend "1 PNT"
        /// you would specify 100 here.
        cost: u64,

        /// The most the cost of a pixel should be multipled by, e.g. if a pixel was
        /// just drawn.
        cost_multiplier: u64,

        /// How long it takes for the cost multiplier to decay back to 1 after a pixel
        /// was just drawn.
        cost_multiplier_decay_s: u64,

        /// The default color of the pixels. If a paletter is set, this color must be a
        /// part of the palette.
        default_color: Color,

        /// Whether it is possible to draw multiple pixels at once.
        can_draw_multiple_pixels_at_once: bool,

        /// Whether the owner of the canvas has super admin privileges. Super admin
        /// powers are the same as normal admin powers but in addition you have the
        /// ability to add / remove additional admins. Set at creation time and can
        /// never be changed.
        owner_is_super_admin: bool,

        /// Max number of pixels can draw at one time
        max_number_of_pixels_per_draw: u64,

        /// Drawing is enabled or not
        draw_enabled_for_non_admin: bool,
    }

    struct Pixel has copy, drop, store {
        /// The color of the pixel.
        color: Color,

        /// When the pixel was last drawn.
        drawn_at_s: u64,
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
        cost_multiplier: u64,
        cost_multiplier_decay_s: u64,
        default_color_r: u8,
        default_color_g: u8,
        default_color_b: u8,
        can_draw_multiple_pixels_at_once: bool,
        owner_is_super_admin: bool,
        max_number_of_pixels_per_draw: u64,
        draw_enabled_for_non_admin: bool,
    ) {
        let config = CanvasConfig {
            width,
            height,
            per_account_timeout_s,
            can_draw_for_s,
            palette: vector::empty(),
            cost,
            cost_multiplier,
            cost_multiplier_decay_s,
            default_color: Color {
                r: default_color_r,
                g: default_color_g,
                b: default_color_b,
            },
            can_draw_multiple_pixels_at_once,
            owner_is_super_admin,
            max_number_of_pixels_per_draw,
            draw_enabled_for_non_admin,
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
        assert_caller_is_collection_owner(caller);
        assert_canvas_dimension_is_within_limit(config.width, config.height);

        // If a palette is given, assert it contains the default color.
        if (!vector::is_empty(&config.palette)) {
            assert!(
                vector::contains(&config.palette, &config.default_color),
                error::invalid_argument(E_CREATION_INITIAL_COLOR_NOT_IN_PALETTE),
            );
        };

        // Assert the cost values are correct.
        assert!(
            config.cost_multiplier >= 1,
            error::invalid_argument(E_CREATION_COST_MULTIPLIER_TOO_LOW),
        );

        // Create the token. This creates an ObjectCore and Token.
        // TODO: Use token::create when AUIDs are enabled.
        let constructor_ref = token::create_from_account(
            caller,
            get_collection_name(),
            description,
            name,
            option::none(),
            // We use a dummy URI and then change it after once we know the object address.
            string::utf8(b"dummy"),
        );

        // Create the canvas.
        let canvas = Canvas {
            config,
            pixels: smart_table::new(),
            last_contribution_s: smart_table::new(),
            allowlisted_artists: simple_set::create(),
            blocklisted_artists: simple_set::create(),
            admins: simple_set::create(),
            created_at_s: now_seconds(),
            extend_ref: object::generate_extend_ref(&constructor_ref),
            mutator_ref: token::generate_mutator_ref(&constructor_ref),
        };

        let object_signer = object::generate_signer(&constructor_ref);

        // Move the canvas resource into the object.
        move_to(&object_signer, canvas);

        let obj = object::object_from_constructor_ref(&constructor_ref);

        // See https://aptos-org.slack.com/archives/C03N9HNSUB1/p1686764312687349 for more info on this mess.
        // Trim the the leading @
        let object_address_string = string_utils::to_string_with_canonical_addresses(&object::object_address(&obj));
        let object_address_string = string::sub_string(
            &object_address_string,
            1,
            string::length(&object_address_string),
        );
        let chain_id = get_chain_id();
        let network_str = if (chain_id == 1) {
            b"mainnet"
        } else if (chain_id == 2) {
            b"testnet"
        } else {
            b"devnet"
        };
        let uri = string::utf8(b"https://");
        string::append(&mut uri, string::utf8(network_str));
        string::append(&mut uri, string::utf8(b".graffio.art/media/0x"));
        string::append(&mut uri, object_address_string);
        string::append(&mut uri, string::utf8(b".png"));

        // Set the real URI.
        token::set_uri(&token::generate_mutator_ref(&constructor_ref), uri);

        obj
    }

    /// Draw many pixels to the canvas. We consider the top left corner 0,0.
    public entry fun draw(
        caller: &signer,
        canvas: Object<Canvas>,
        // If it was possible to have a vector of structs that'd be great but for now
        // we have to explode the items into separate vectors.
        xs: vector<u64>,
        ys: vector<u64>,
        rs: vector<u8>,
        gs: vector<u8>,
        bs: vector<u8>,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);

        // Make sure the caller is allowed to draw.
        assert_allowlisted_to_draw(canvas, caller_addr);

        // Make sure canvas is open to draw.
        assert_canvas_enabled_for_non_admin(signer::address_of(caller), canvas);

        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));

        // If `can_draw_for_s` is non-zero, confirm that the canvas is still open.
        // This is a more granular control than draw_enabled_for_non_admin as it checks open for a certain time
        if (canvas_.config.can_draw_for_s > 0) {
            let now = now_seconds();
            assert!(
                now <= (canvas_.created_at_s + canvas_.config.can_draw_for_s),
                error::invalid_state(E_CANVAS_CLOSED),
            );
        };

        // Assert the vectors are all the same length.
        assert!(
            vector::length(&xs) == vector::length(&ys),
            error::invalid_argument(E_INVALID_VECTOR_LENGTHS),
        );
        assert!(
            vector::length(&xs) == vector::length(&rs),
            error::invalid_argument(E_INVALID_VECTOR_LENGTHS),
        );
        assert!(
            vector::length(&xs) == vector::length(&gs),
            error::invalid_argument(E_INVALID_VECTOR_LENGTHS),
        );
        assert!(
            vector::length(&xs) == vector::length(&bs),
            error::invalid_argument(E_INVALID_VECTOR_LENGTHS),
        );

        assert!(
            vector::length(&xs) <= canvas_.config.max_number_of_pixels_per_draw,
            error::invalid_argument(E_EXCEED_MAX_NUMBER_OF_PIXELS_PER_DRAW),
        );

        assert_timeout_and_update_last_contribution_time(signer::address_of(caller), canvas);

        let i = 0;
        let len = vector::length(&xs);
        while (i < len) {
            let x = vector::pop_back(&mut xs);
            let y = vector::pop_back(&mut ys);
            let r = vector::pop_back(&mut rs);
            let g = vector::pop_back(&mut gs);
            let b = vector::pop_back(&mut bs);
            draw_one(caller_addr, canvas, x, y, r, g, b);
            i = i + 1;
        };
    }

    /// Draw a single pixel to the canvas. We consider the top left corner 0,0.
    public fun draw_one(
        caller_addr: address,
        canvas: Object<Canvas>,
        x: u64,
        y: u64,
        r: u8,
        g: u8,
        b: u8,
    ) acquires Canvas {
        let cost = determine_cost(canvas, x, y);

        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));

        // Confirm the coordinates are not out of bounds.
        assert!(x < canvas_.config.width, error::invalid_argument(E_COORDINATE_OUT_OF_BOUNDS));
        assert!(y < canvas_.config.height, error::invalid_argument(E_COORDINATE_OUT_OF_BOUNDS));

        // If there is a cost, take the PNT and burn it.
        if (cost > 0) {
            paint_fungible_asset::burn(caller_addr, cost);
        };

        // Write the pixel.
        let color = Color { r, g, b };
        let pixel = Pixel { color, drawn_at_s: now_seconds() };
        let index = y * canvas_.config.width + x;
        smart_table::upsert(&mut canvas_.pixels, index, pixel);
    }

    fun assert_timeout_and_update_last_contribution_time(
        caller_addr: address,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        let caller_is_admin = is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        // If there is a per-account timeout, first confirm that the caller is allowed
        // to write a pixel, and if so, update their last contribution time.
        if (canvas_.config.per_account_timeout_s > 0) {
            let now = now_seconds();
            if (smart_table::contains(&canvas_.last_contribution_s, caller_addr)) {
                let last_contribution = smart_table::borrow(&canvas_.last_contribution_s, caller_addr);
                // Admin is not restricted by timeout
                if (!caller_is_admin) {
                    assert!(
                        now >= (*last_contribution + canvas_.config.per_account_timeout_s),
                        error::invalid_state(E_MUST_WAIT),
                    );
                };
                *smart_table::borrow_mut(&mut canvas_.last_contribution_s, caller_addr) = now;
            } else {
                smart_table::add(&mut canvas_.last_contribution_s, caller_addr, now);
            };
        };
    }

    fun assert_canvas_enabled_for_non_admin(
        caller_addr: address,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        let caller_is_admin = is_admin(canvas, caller_addr);
        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));
        if (!caller_is_admin) {
            assert!(
                canvas_.config.draw_enabled_for_non_admin,
                E_DRAW_DISABLED_FOR_NON_ADMIN
            )
        }
    }

    #[view]
    /// Determine the cost to draw a single pixel.
    public fun determine_cost(canvas: Object<Canvas>, x: u64, y: u64): u64 acquires Canvas {
        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));

        // Exit early if there is no cost / decay.
        if (canvas_.config.cost == 0 || canvas_.config.cost_multiplier_decay_s == 0) {
            return 0
        };

        // Determine when the pixel was last drawn.
        let index = y * canvas_.config.width + x;
        let drawn_at_s = if (smart_table::contains(&canvas_.pixels, index)) {
            let pixel = smart_table::borrow(&canvas_.pixels, index);
            pixel.drawn_at_s
        } else {
            0
        };

        let seconds_since_last_drawn = now_seconds() - drawn_at_s;
        let override_cost = if (seconds_since_last_drawn >= canvas_.config.cost_multiplier_decay_s) {
            0
        } else {
            let seconds_remaining = canvas_.config.cost_multiplier_decay_s - seconds_since_last_drawn;
            let cost_differential = canvas_.config.cost * canvas_.config.cost_multiplier - canvas_.config.cost;
            math64::mul_div(cost_differential, seconds_remaining, canvas_.config.cost_multiplier_decay_s)
        };
        canvas_.config.cost + override_cost
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

    fun assert_canvas_dimension_is_within_limit(width: u64, height: u64) {
        let (max_width, max_height) = get_max_canvas_dimension();
        assert!(
            width <= max_width && height <= max_height,
            error::invalid_state(E_CANVAS_EXCEEDED_MAX_ALLOWED_DIMENSIONS)
        );
    }

    ///////////////////////////////////////////////////////////////////////////////////
    //                                  Collection owner                             //
    ///////////////////////////////////////////////////////////////////////////////////

    fun assert_caller_is_collection_owner(caller: &signer) {
        let collection = get_collection();
        assert!(is_owner_of_collection(caller, collection), error::invalid_state(E_CALLER_NOT_COLLECTION_OWNER));
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
            created_at_s,
            extend_ref,
            mutator_ref,
        } = old_canvas_;
        let object_signer = object::generate_signer_for_extending(&extend_ref);
        let new_canvas_ = Canvas {
            config,
            pixels,
            last_contribution_s: smart_table::new(),
            allowlisted_artists,
            blocklisted_artists,
            admins,
            created_at_s,
            extend_ref,
            mutator_ref,
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

    public entry fun update_max_number_of_piexls_per_draw(
        caller: &signer,
        canvas: Object<Canvas>,
        updated_max_number_of_pixels_per_draw: u64,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        canvas_.config.max_number_of_pixels_per_draw = updated_max_number_of_pixels_per_draw
    }

    public entry fun enable_draw_for_non_admin(
        caller: &signer,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        canvas_.config.draw_enabled_for_non_admin = true
    }

    public entry fun disable_draw_for_non_admin(
        caller: &signer,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        canvas_.config.draw_enabled_for_non_admin = false
    }

    public entry fun update_per_account_timeout(
        caller: &signer,
        canvas: Object<Canvas>,
        updated_per_account_timeout_s: u64,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        canvas_.config.per_account_timeout_s = updated_per_account_timeout_s
    }

    public entry fun clear(
        caller: &signer,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let old_canvas_ = move_from<Canvas>(object::object_address(&canvas));
        let Canvas {
            config,
            pixels,
            last_contribution_s,
            allowlisted_artists,
            blocklisted_artists,
            admins,
            created_at_s,
            extend_ref,
            mutator_ref,
        } = old_canvas_;
        let object_signer = object::generate_signer_for_extending(&extend_ref);
        let new_canvas_ = Canvas {
            config,
            pixels: smart_table::new(),
            last_contribution_s,
            allowlisted_artists,
            blocklisted_artists,
            admins,
            created_at_s,
            extend_ref,
            mutator_ref,
        };
        move_to(&object_signer, new_canvas_);
        smart_table::destroy(pixels);
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
    //                                 Collection owner                              //
    ///////////////////////////////////////////////////////////////////////////////////
    // Functions that only the collection owner can call.

    /// Set the URI for the token. This is necessary if down the line we change how we generate the image.
    public entry fun set_uri(caller: &signer, canvas: Object<Canvas>, uri: String) acquires Canvas {
        let collection = get_collection();
        assert!(
            is_owner_of_collection(caller, collection),
            error::invalid_argument(E_CALLER_NOT_COLLECTION_OWNER),
        );
        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));
        token::set_uri(&canvas_.mutator_ref, uri);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    //                                     Tests                                     //
    ///////////////////////////////////////////////////////////////////////////////////

    #[test_only]
    use addr::canvas_collection::{init_module_for_test as collection_init_module_for_test};
    #[test_only]
    use addr::paint_fungible_token;
    #[test_only]
    use std::timestamp;
    #[test_only]
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    #[test_only]
    use aptos_framework::account::{Self};
    #[test_only]
    use aptos_framework::coin;
    #[test_only]
    use aptos_framework::chain_id;

    #[test_only]
    const ONE_APT: u64 = 100000000;

    #[test_only]
    const STARTING_BALANCE: u64 = 50 * 100000000;

    #[test_only]
    /// Create a test account with some funds.
    fun create_test_account(
        caller: &signer,
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

        // Mint some PNT too.
        paint_fungible_asset::mint(caller, signer::address_of(account), 1000);
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
    fun init_test(caller: &signer, friend1: &signer, friend2: &signer, aptos_framework: &signer) {
        set_global_time(aptos_framework, 100);
        chain_id::initialize_for_test(aptos_framework, 3);
        collection_init_module_for_test(caller);
        paint_fungible_token::test_init(caller);
        create_test_account(caller, aptos_framework, caller);
        create_test_account(caller, aptos_framework, friend1);
        create_test_account(caller, aptos_framework, friend2);
    }

    #[test_only]
    fun create_canvas(
        caller: &signer,
        width: u64,
        height: u64,
        cost: u64,
        cost_multiplier: u64,
        cost_multiplier_decay_s: u64,
    ): Object<Canvas> {
        let config = CanvasConfig {
            width,
            height,
            per_account_timeout_s: 1,
            can_draw_for_s: 0,
            palette: vector::empty(),
            cost,
            cost_multiplier,
            cost_multiplier_decay_s,
            default_color: Color {
                r: 0,
                g: 0,
                b: 0,
            },
            can_draw_multiple_pixels_at_once: false,
            owner_is_super_admin: true,
            max_number_of_pixels_per_draw: 1,
            draw_enabled_for_non_admin: true,
        };

        create_(caller, string::utf8(b"description"), string::utf8(b"name"), config)
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_create(caller: signer, friend1: signer, friend2: signer, aptos_framework: signer) {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        create_canvas(&caller, 50, 50, 1, 1, 0);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 196618, location = addr::canvas_token)]
    fun test_cannot_create_canvas_as_non_collection_owner(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        create_canvas(&friend1, 50, 50, 1, 1, 0);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 196621, location = addr::canvas_token)]
    fun test_cannot_create_canvas_larger_than_max_dimension_defined_in_collection(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Expect to fail cause default max canvas limit is 1000 x 1000
        create_canvas(&caller, 1001, 1001, 1, 1, 0);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_determine_cost(caller: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);

        // See that when `cost` is zero, the draw cost is zero.
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        assert!(determine_cost(canvas, 0, 0) == 0, 1);

        // See that when `cost` is one and the multiplier is one, the draw cost is one.
        let canvas = create_canvas(&caller, 50, 50, 1, 1, 60);
        assert!(determine_cost(canvas, 0, 0) == 1, 1);

        // See that when `cost` is five and the multiplier is one, the draw cost is five.
        let canvas = create_canvas(&caller, 50, 50, 5, 1, 60);
        assert!(determine_cost(canvas, 0, 0) == 5, 1);

        // See that when `cost` is five and the multiplier is three, the draw cost is
        // still five for the first draw.
        let canvas = create_canvas(&caller, 50, 50, 5, 3, 60);
        assert!(determine_cost(canvas, 0, 0) == 5, 1);

        // See that when `cost` is five and the multiplier is four, after drawing a
        // pixel, drawing that same pixel costs four times as much.
        let canvas = create_canvas(&caller, 50, 50, 5, 4, 60);
        draw_one(signer::address_of(&caller), canvas, 0, 0, 255, 255, 255);
        assert!(determine_cost(canvas, 0, 0) == 20, 1);

        // See that after passing half of the delay time, the cost is half of what it
        // was at its peak.
        set_global_time(&aptos_framework, 130);
        assert!(determine_cost(canvas, 0, 0) == 12, 1);

        // Check the cost after passing 3/4 of the delay time. The value is rounded.
        set_global_time(&aptos_framework, 145);
        assert!(determine_cost(canvas, 0, 0) == 8, 1);

        // See that after passing the full delay time, the cost is back to the lowest.
        set_global_time(&aptos_framework, 160);
        assert!(determine_cost(canvas, 0, 0) == 5, 1);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_admin_not_restricted_by_per_account_timeout(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        // Admin can draw consequently without restricted by the timeout
        draw(&caller, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        draw(&caller, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        draw(&caller, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 65547, location = addr::canvas_token)]
    fun test_max_number_of_pixels_per_draw(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially set max number of pixels can draw to 1
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        // Can draw 1 pixel
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        // Cannot draw 2 pixels
        draw(&friend1, canvas, vector[1, 2], vector[1, 2], vector[1, 2], vector[1, 2], vector[1, 2]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 196612, location = addr::canvas_token)]
    fun test_only_admin_can_update_max_number_of_pixels_per_draw(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially set max number of pixels per draw to 1
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        // Non admin cannot update max number of pixels per draw to 2
        update_max_number_of_piexls_per_draw(&friend1, canvas, 2);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_admin_can_update_max_number_of_pixels_per_draw(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially set max number of pixels per draw to 1
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        // Can draw 1 pixel
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        // Update max number of pixels per draw to 2
        update_max_number_of_piexls_per_draw(&caller, canvas, 2);
        // Wait for 1 second
        timestamp::fast_forward_seconds(1);
        // Can draw 2 pixels now
        draw(&friend1, canvas, vector[1, 2], vector[1, 2], vector[1, 2], vector[1, 2], vector[1, 2]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 196614, location = addr::canvas_token)]
    fun test_per_account_timeout(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        // Wait for 1 second
        timestamp::fast_forward_seconds(1);
        // Should be able to draw now since timeout already passed
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        // Cannot draw immediately
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_admin_can_update_per_account_timeout(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        // Update per account timeout to 2 seconds
        update_per_account_timeout(&caller, canvas, 2);
        // Wait for 2 second
        timestamp::fast_forward_seconds(2);
        // Should be able to draw now since timeout already passed
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 196612, location = addr::canvas_token)]
    fun test_nonadmin_cannot_update_per_account_timeout(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        // Non admin cannot update per account timeout to 2 seconds
        update_per_account_timeout(&friend1, canvas, 2);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 12, location = addr::canvas_token)]
    fun test_nonadmin_cannot_draw_after_drawing_disabled_by_admin(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        // Non admin can draw
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        // Admin disable drawing
        disable_draw_for_non_admin(&caller, canvas);
        // Non admin cannot draw
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = 196612, location = addr::canvas_token)]
    fun test_nonadmin_cannot_disable_drawing(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        // Non admin cannot disable drawing
        disable_draw_for_non_admin(&friend1, canvas);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_nonadmin_can_draw_after_drawing_enabled_by_admin(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50, 0, 1, 60);
        // Non admin can draw
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        // Admin disable drawing
        disable_draw_for_non_admin(&caller, canvas);
        // Admin can still draw after disabled
        draw(&caller, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
        // Admin re-enable drawing
        enable_draw_for_non_admin(&caller, canvas);
        // Wait for 1 second so non admin pass the timeout
        timestamp::fast_forward_seconds(1);
        // Non admin can draw
        draw(&friend1, canvas, vector[1], vector[1], vector[1], vector[1], vector[1]);
    }
}
