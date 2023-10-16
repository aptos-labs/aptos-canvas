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
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::timestamp::now_seconds;
    use aptos_framework::chain_id::{get as get_chain_id};
    use aptos_std::object::{Self, ExtendRef, Object};
    use aptos_std::string_utils;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_std::table::{Self, Table};
    use aptos_token_objects::token::{Self, MutatorRef};

    /// The caller tried to draw outside the bounds of the canvas.
    const E_COORDINATE_OUT_OF_BOUNDS: u64 = 1;

    /// The caller tried to call a function that requires super admin privileges
    /// but they're not the super admin (the owner) or there is no super admin
    /// at all (as per owner_is_super_admin).
    const E_CALLER_NOT_SUPER_ADMIN: u64 = 2;

    /// The caller tried to call a function that requires admin privileges
    /// but they're not an admin / there are no admins at all.
    const E_CALLER_NOT_ADMIN: u64 = 3;

    /// The caller tried to draw a pixel but the canvas is no longer open for new contributions
    const E_CANVAS_CLOSED: u64 = 4;

    /// The caller tried to draw a pixel but they contributed too recently based on
    /// the configured `per_account_timeout_s`. They must try again later.
    const E_MUST_WAIT: u64 = 5;

    /// Vectors provided to draw were of different lengths.
    const E_INVALID_VECTOR_LENGTHS: u64 = 6;

    /// The caller tried to call a function that requires collection owner privileges.
    const E_CALLER_NOT_COLLECTION_OWNER: u64 = 7;

    /// The caller exceeds the max number of pixels per draw.
    const E_EXCEED_MAX_NUMBER_OF_PIXELS_PER_DRAW: u64 = 8;

    /// Drawing disabled for non admin.
    const E_DRAW_DISABLED_FOR_NON_ADMIN: u64 = 9;

    /// Cannot create canvas that is larger than the allowed dimesion set in canvas collection.
    const E_CANVAS_EXCEEDED_MAX_ALLOWED_DIMENSIONS: u64 = 10;

    /// The color for a pixel is not valid or allowed
    const E_INVALID_COLOR: u64 = 11;


    /// The maximum color allowed; i.e a value of 7 indicate there are 8 colors total (zero indexed)
    const MAX_VALID_COLOR: u8 = 7;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct Canvas has key {
        /// The parameters used to configure default creation of the canvas.
        config: CanvasConfig,

        /// The pixels of the canvas.
        pixels: SmartTable<u32, u8>,

        /// When each artist last contributed. Only tracked if
        /// per_account_timeout_s is non-zero.
        last_contribution_s: Table<address, u64>,

        /// Accounts that are allowed to contribute, without any rate limits applied to them
        unlimited_artists: Table<address, bool>,

        /// Accounts that have admin privileges. It is only possible to have admins if
        /// there is a super admin.
        admins: Table<address, bool>,

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
        width: u16,

        /// The width of the canvas.
        height: u16,

        /// How long artists have to wait between contributions. If zero, when
        /// artists contribute is not tracked.
        per_account_timeout_s: u64,

        /// The default color of the pixels. If a paletter is set, this color must be a
        /// part of the palette.
        default_color: u8,

        /// Max number of pixels can draw at one time
        max_number_of_pixels_per_draw: u64,

        /// Drawing is enabled or not
        draw_enabled_for_non_admin: bool,
    }

    /// Create a new canvas.
    public entry fun create(
        caller: &signer,
        // Arguments for the token + object.
        description: String,
        name: String,
        // Arguments for the canvas
        width: u16,
        height: u16,
        per_account_timeout_s: u64,
        default_color: u8,
        max_number_of_pixels_per_draw: u64,
        draw_enabled_for_non_admin: bool,
    ) {
        assert_valid_color(default_color);
        let config = CanvasConfig {
            width,
            height,
            per_account_timeout_s,
            default_color,
            max_number_of_pixels_per_draw,
            draw_enabled_for_non_admin,
        };
        create_(caller, description, name, config);
    }

    /// This function is separate from the top level create function so we can use it
    /// in tests. This is necessary because entry functions (correctly) cannot return
    /// anything but we need it to return the object with the canvas in it. They also
    /// cannot take in struct arguments, which again is convenient for testing.
    fun create_(
        caller: &signer,
        description: String,
        name: String,
        config: CanvasConfig,
    ): Object<Canvas> {
        assert_caller_is_collection_owner(caller);
        assert_canvas_dimension_is_within_limit(config.width, config.height);

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
            last_contribution_s: table::new(),
            unlimited_artists: table::new(),
            admins: table::new(),
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
        xs: vector<u16>,
        ys: vector<u16>,
        colors: vector<u8>,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);

        // Make sure canvas is open to draw.
        assert_canvas_enabled_for_non_unlimited_drawers(caller_addr, canvas);
        assert_timeout_and_update_last_contribution_time(caller_addr, canvas);

        let caller_can_draw_unlimited = can_draw_unlimited(canvas, caller_addr);

        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));

        // Assert the vectors are all the same length.
        assert!(
            vector::length(&xs) == vector::length(&ys),
            E_INVALID_VECTOR_LENGTHS,
        );
        assert!(
            vector::length(&xs) == vector::length(&colors),
            E_INVALID_VECTOR_LENGTHS,
        );

        if (!caller_can_draw_unlimited) {
            assert!(
                vector::length(&xs) <= canvas_.config.max_number_of_pixels_per_draw,
                E_EXCEED_MAX_NUMBER_OF_PIXELS_PER_DRAW,
            );
        };

        let canvas_width = (canvas_.config.width as u32);
        let canvas_height = (canvas_.config.height as u32);


        let i = 0;
        let len = vector::length(&xs);
        while (i < len) {
            let x = (vector::pop_back(&mut xs) as u32);
            //let x = (*vector::borrow(&xs, i) as u32);

            let y = (vector::pop_back(&mut ys) as u32);
            //let y = (*vector::borrow(&ys, i) as u32);

            assert!(x < canvas_width, E_COORDINATE_OUT_OF_BOUNDS);
            assert!(y < canvas_height, E_COORDINATE_OUT_OF_BOUNDS);


            let color = vector::pop_back(&mut colors);
            //let color = *vector::borrow(&colors, i);

            assert_valid_color(color);

            let index = y * canvas_width + x;
            smart_table::upsert(&mut canvas_.pixels, index, color);

            i = i + 1;
        };
    }

    fun assert_timeout_and_update_last_contribution_time(
        caller_addr: address,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        if (is_admin(canvas, caller_addr)) return;
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        if (is_unlimited_artist_(canvas_, caller_addr)) return;

        // If there is a per-account timeout, first confirm that the caller is allowed
        // to write a pixel, and if so, update their last contribution time.
        if (canvas_.config.per_account_timeout_s > 0) {
            // Admin is not restricted by timeout
            let now = now_seconds();
            if (table::contains(&canvas_.last_contribution_s, caller_addr)) {
                let last_contribution = table::borrow(&canvas_.last_contribution_s, caller_addr);

                assert!(
                    now >= (*last_contribution + canvas_.config.per_account_timeout_s),
                    E_MUST_WAIT,
                );
                *table::borrow_mut(&mut canvas_.last_contribution_s, caller_addr) = now;
            } else {
                table::add(&mut canvas_.last_contribution_s, caller_addr, now);
            };
        };
    }

    fun assert_canvas_enabled_for_non_unlimited_drawers(
        caller_addr: address,
        canvas: Object<Canvas>,
    ) acquires Canvas {
        let caller_can_draw_unlimited = can_draw_unlimited(canvas, caller_addr);
        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));
        if (!caller_can_draw_unlimited) {
            assert!(
                canvas_.config.draw_enabled_for_non_admin,
                E_DRAW_DISABLED_FOR_NON_ADMIN
            )
        }
    }

    struct TableHolder<phantom K: copy + drop, phantom V> has store, key {
        table: Table<K, V>
    }

    /// Since we can't delete tables, we just hide them in random objects :-O
    fun hide_a_table<K: copy + drop, V>(creator: &signer, old_table: Table<K, V>) {
        let constructor_ref = object::create_object(signer::address_of(creator));
        let object_signer = object::generate_signer(&constructor_ref);
        move_to(&object_signer, TableHolder { table: old_table });
    }

    #[view]
    /// Check whether the caller is bounded by the per pixel limits or not
    /// Returns a boolean
    public fun is_unlimited_artist(canvas: Object<Canvas>, caller_addr: address): bool acquires Canvas {
        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));
        is_unlimited_artist_(canvas_, caller_addr)
    }

    fun is_unlimited_artist_(canvas: &Canvas, caller_addr: address): bool {
        table::contains(&canvas.unlimited_artists, caller_addr)
    }

    fun assert_canvas_dimension_is_within_limit(width: u16, height: u16) {
        let (max_width, max_height) = get_max_canvas_dimension();
        assert!(
            width <= max_width && height <= max_height,
            E_CANVAS_EXCEEDED_MAX_ALLOWED_DIMENSIONS
        );
    }

    fun assert_valid_color(color: u8) {
        assert!(color <= MAX_VALID_COLOR, E_INVALID_COLOR);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    //                                  Collection owner                             //
    ///////////////////////////////////////////////////////////////////////////////////

    fun assert_caller_is_collection_owner(caller: &signer) {
        let collection = get_collection();
        assert!(is_owner_of_collection(caller, collection), E_CALLER_NOT_COLLECTION_OWNER);
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
        table::upsert(&mut canvas_.admins, addr, true);
    }

    public entry fun remove_admin(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_super_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        table::remove(&mut canvas_.admins, addr);
    }

    fun assert_is_super_admin(canvas: Object<Canvas>, caller_addr: address) {
        assert!(is_super_admin(canvas, caller_addr), E_CALLER_NOT_SUPER_ADMIN);
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
            unlimited_artists,
            admins,
            created_at_s,
            extend_ref,
            mutator_ref,
        } = old_canvas_;
        hide_a_table(caller, last_contribution_s);
        let object_signer = object::generate_signer_for_extending(&extend_ref);
        let new_canvas_ = Canvas {
            config,
            pixels,
            last_contribution_s: table::new(),
            unlimited_artists,
            admins,
            created_at_s,
            extend_ref,
            mutator_ref,
        };
        move_to(&object_signer, new_canvas_);
    }


    ///////////////////////////////////////////////////////////////////////////////////
    //                                     Admin                                     //
    ///////////////////////////////////////////////////////////////////////////////////

    public entry fun add_to_unlimited_artists(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        table::upsert(&mut canvas_.unlimited_artists, addr, true);
    }

    public entry fun remove_from_unlimited_artists(
        caller: &signer,
        canvas: Object<Canvas>,
        addr: address,
    ) acquires Canvas {
        let caller_addr = signer::address_of(caller);
        assert_is_admin(canvas, caller_addr);
        let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
        table::remove(&mut canvas_.unlimited_artists, addr);
    }

    public entry fun update_max_number_of_pixels_per_draw(
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
            unlimited_artists,
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
            unlimited_artists,
            admins,
            created_at_s,
            extend_ref,
            mutator_ref,
        };
        move_to(&object_signer, new_canvas_);
        smart_table::destroy(pixels);
    }

    fun assert_is_admin(canvas: Object<Canvas>, caller_addr: address) acquires Canvas {
        assert!(is_admin(canvas, caller_addr), E_CALLER_NOT_ADMIN);
    }

    #[view]
    /// Check whether the caller is an admin (if there are any at all). We also check
    /// if they're the super admin, since that's a higher privilege level.
    public fun is_admin(canvas: Object<Canvas>, caller_addr: address): bool acquires Canvas {
        if (is_super_admin(canvas, caller_addr)) {
            return true
        };

        let canvas_ = borrow_global<Canvas>(object::object_address(&canvas));
        table::contains(&canvas_.admins, caller_addr) && *table::borrow(&canvas_.admins, caller_addr)
    }

    #[view]
    /// The super admin is the creator/owner of the actual canvas object
    /// They are root
    public fun is_super_admin(canvas: Object<Canvas>, caller_addr: address): bool {
        object::is_owner(canvas, caller_addr)
    }


    #[view]
    /// Is the caller allowed to draw without time or other limitations?
    public fun can_draw_unlimited(canvas: Object<Canvas>, caller_addr: address): bool acquires Canvas {
        is_admin(canvas, caller_addr) || is_unlimited_artist(canvas, caller_addr)
    }

    ///////////////////////////////////////////////////////////////////////////////////
    //                                 Collection owner                              //
    ///////////////////////////////////////////////////////////////////////////////////
    // Functions that only the collection owner can call.

    /// Set the URI for the token. This is necessary if down the line we change how we generate the image.
    public entry fun set_uri(caller: &signer, canvas: Object<Canvas>, uri: String) acquires Canvas {
        assert_caller_is_collection_owner(caller);
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
        use addr::paint_fungible_asset;
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
        width: u16,
        height: u16,
    ): Object<Canvas> {
        let config = CanvasConfig {
            width,
            height,
            per_account_timeout_s: 1,
            default_color: 0,
            max_number_of_pixels_per_draw: 1,
            draw_enabled_for_non_admin: true,
        };

        create_(caller, string::utf8(b"description"), string::utf8(b"name"), config)
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_create(caller: signer, friend1: signer, friend2: signer, aptos_framework: signer) {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        create_canvas(&caller, 50, 50);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = E_CALLER_NOT_COLLECTION_OWNER, location = addr::canvas_token)]
    fun test_cannot_create_canvas_as_non_collection_owner(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        create_canvas(&friend1, 50, 50);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = E_CANVAS_EXCEEDED_MAX_ALLOWED_DIMENSIONS, location = addr::canvas_token)]
    fun test_cannot_create_canvas_larger_than_max_dimension_defined_in_collection(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Expect to fail cause default max canvas limit is 1000 x 1000
        create_canvas(&caller, 1001, 1001);
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
        let canvas = create_canvas(&caller, 50, 50);
        // Admin can draw consequently without restricted by the timeout
        draw(&caller, canvas, vector[1], vector[1], vector[1]);
        draw(&caller, canvas, vector[1], vector[1], vector[1]);
        draw(&caller, canvas, vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_unlimited_artist_not_restricted_by_per_account_timeout(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50);
        add_to_unlimited_artists(&caller, canvas, signer::address_of(&friend1));
        // unlimited artist can draw consequently without restricted by the timeout
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_superadmin_can_add_admins(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50);
        add_admin(&caller, canvas, signer::address_of(&friend1));
        // The new admin can draw consequently without restricted by the timeout
        draw(&caller, canvas, vector[1], vector[1], vector[1]);
        draw(&caller, canvas, vector[1], vector[1], vector[1]);
        draw(&caller, canvas, vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun canvas_creator_is_superadmin(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50);
        assert!(is_super_admin(canvas, signer::address_of(&caller)), 0);
        assert!(!is_super_admin(canvas, signer::address_of(&friend1)), 1);
        assert!(!is_super_admin(canvas, signer::address_of(&friend2)), 2);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = E_EXCEED_MAX_NUMBER_OF_PIXELS_PER_DRAW, location = addr::canvas_token)]
    fun test_max_number_of_pixels_per_draw(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially set max number of pixels can draw to 1
        let canvas = create_canvas(&caller, 50, 50);
        // Can draw 1 pixel
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        // Cannot draw 2 pixels
        draw(&friend2, canvas, vector[1, 2], vector[1, 2], vector[1, 2]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = E_CALLER_NOT_ADMIN, location = addr::canvas_token)]
    fun test_only_admin_can_update_max_number_of_pixels_per_draw(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially set max number of pixels per draw to 1
        let canvas = create_canvas(&caller, 50, 50);
        // Non admin cannot update max number of pixels per draw to 2
        update_max_number_of_pixels_per_draw(&friend1, canvas, 2);
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
        let canvas = create_canvas(&caller, 50, 50);
        // Can draw 1 pixel
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        // Update max number of pixels per draw to 2
        update_max_number_of_pixels_per_draw(&caller, canvas, 2);
        // Wait for 1 second
        timestamp::fast_forward_seconds(1);
        // Can draw 2 pixels now
        draw(&friend1, canvas, vector[1, 2], vector[1, 2], vector[1, 2]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = E_MUST_WAIT, location = addr::canvas_token)]
    fun test_per_account_timeout(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50);
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        // Wait for 1 second
        timestamp::fast_forward_seconds(1);
        // Should be able to draw now since timeout already passed
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        // Cannot draw immediately
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
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
        let canvas = create_canvas(&caller, 50, 50);
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        // Update per account timeout to 2 seconds
        update_per_account_timeout(&caller, canvas, 2);
        // Wait for 2 second
        timestamp::fast_forward_seconds(2);
        // Should be able to draw now since timeout already passed
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = E_CALLER_NOT_ADMIN, location = addr::canvas_token)]
    fun test_nonadmin_cannot_update_per_account_timeout(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50);
        // Non admin cannot update per account timeout to 2 seconds
        update_per_account_timeout(&friend1, canvas, 2);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = E_DRAW_DISABLED_FOR_NON_ADMIN, location = addr::canvas_token)]
    fun test_nonadmin_cannot_draw_after_drawing_disabled_by_admin(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50);
        // Non admin can draw
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        // Admin disable drawing
        disable_draw_for_non_admin(&caller, canvas);
        // Non admin cannot draw
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
    }

    #[test(caller = @addr, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    #[expected_failure(abort_code = E_CALLER_NOT_ADMIN, location = addr::canvas_token)]
    fun test_nonadmin_cannot_disable_drawing(
        caller: signer,
        friend1: signer,
        friend2: signer,
        aptos_framework: signer
    ) acquires Canvas {
        init_test(&caller, &friend1, &friend2, &aptos_framework);
        // Initially per account timeout to 1 second
        let canvas = create_canvas(&caller, 50, 50);
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
        let canvas = create_canvas(&caller, 50, 50);
        // Non admin can draw
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        // Admin disable drawing
        disable_draw_for_non_admin(&caller, canvas);
        // Admin can still draw after disabled
        draw(&caller, canvas, vector[1], vector[1], vector[1]);
        // Admin re-enable drawing
        enable_draw_for_non_admin(&caller, canvas);
        // Wait for 1 second so non admin pass the timeout
        timestamp::fast_forward_seconds(1);
        // Non admin can draw
        draw(&friend1, canvas, vector[1], vector[1], vector[1]);
        // Admin can still draw after enabled
        draw(&caller, canvas, vector[1], vector[1], vector[1]);
    }
}
