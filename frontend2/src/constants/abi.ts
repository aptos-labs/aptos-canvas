export const ABI = {
  "address": "0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146",
  "name": "canvas_token",
  "friends": [],
  "exposed_functions": [
    {
      "name": "add_admin",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": []
    },
    {
      "name": "add_to_allowlist",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": []
    },
    {
      "name": "add_to_blocklist",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": []
    },
    {
      "name": "allowlisted_to_draw",
      "visibility": "public",
      "is_entry": false,
      "is_view": true,
      "generic_type_params": [],
      "params": [
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": [
        "u8"
      ]
    },
    {
      "name": "clear",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>"
      ],
      "return": []
    },
    {
      "name": "clear_contribution_timeouts",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>"
      ],
      "return": []
    },
    {
      "name": "create",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::string::String",
        "0x1::string::String",
        "u64",
        "u64",
        "u64",
        "u64",
        "u64",
        "u64",
        "u64",
        "u8",
        "u8",
        "u8",
        "bool",
        "bool",
        "u64",
        "bool"
      ],
      "return": []
    },
    {
      "name": "create_",
      "visibility": "public",
      "is_entry": false,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::string::String",
        "0x1::string::String",
        "0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::CanvasConfig"
      ],
      "return": [
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>"
      ]
    },
    {
      "name": "determine_cost",
      "visibility": "public",
      "is_entry": false,
      "is_view": true,
      "generic_type_params": [],
      "params": [
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "u64",
        "u64"
      ],
      "return": [
        "u64"
      ]
    },
    {
      "name": "disable_draw_for_non_admin",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>"
      ],
      "return": []
    },
    {
      "name": "draw",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "vector<u64>",
        "vector<u64>",
        "vector<u8>",
        "vector<u8>",
        "vector<u8>"
      ],
      "return": []
    },
    {
      "name": "draw_one",
      "visibility": "public",
      "is_entry": false,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "address",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "u64",
        "u64",
        "u8",
        "u8",
        "u8"
      ],
      "return": []
    },
    {
      "name": "enable_draw_for_non_admin",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>"
      ],
      "return": []
    },
    {
      "name": "is_admin",
      "visibility": "public",
      "is_entry": false,
      "is_view": true,
      "generic_type_params": [],
      "params": [
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": [
        "bool"
      ]
    },
    {
      "name": "is_super_admin",
      "visibility": "public",
      "is_entry": false,
      "is_view": true,
      "generic_type_params": [],
      "params": [
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": [
        "bool"
      ]
    },
    {
      "name": "remove_admin",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": []
    },
    {
      "name": "remove_from_allowlist",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": []
    },
    {
      "name": "remove_from_blocklist",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "address"
      ],
      "return": []
    },
    {
      "name": "set_uri",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "0x1::string::String"
      ],
      "return": []
    },
    {
      "name": "update_max_number_of_piexls_per_draw",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "u64"
      ],
      "return": []
    },
    {
      "name": "update_per_account_timeout",
      "visibility": "public",
      "is_entry": true,
      "is_view": false,
      "generic_type_params": [],
      "params": [
        "&signer",
        "0x1::object::Object<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Canvas>",
        "u64"
      ],
      "return": []
    }
  ],
  "structs": [
    {
      "name": "Canvas",
      "is_native": false,
      "abilities": [
        "key"
      ],
      "generic_type_params": [],
      "fields": [
        {
          "name": "config",
          "type": "0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::CanvasConfig"
        },
        {
          "name": "pixels",
          "type": "0x1::smart_table::SmartTable<u64, 0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Pixel>"
        },
        {
          "name": "last_contribution_s",
          "type": "0x1::smart_table::SmartTable<address, u64>"
        },
        {
          "name": "allowlisted_artists",
          "type": "0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053::simple_set::SimpleSet<address>"
        },
        {
          "name": "blocklisted_artists",
          "type": "0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053::simple_set::SimpleSet<address>"
        },
        {
          "name": "admins",
          "type": "0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053::simple_set::SimpleSet<address>"
        },
        {
          "name": "created_at_s",
          "type": "u64"
        },
        {
          "name": "extend_ref",
          "type": "0x1::object::ExtendRef"
        },
        {
          "name": "mutator_ref",
          "type": "0x4::token::MutatorRef"
        }
      ]
    },
    {
      "name": "CanvasConfig",
      "is_native": false,
      "abilities": [
        "drop",
        "store"
      ],
      "generic_type_params": [],
      "fields": [
        {
          "name": "width",
          "type": "u64"
        },
        {
          "name": "height",
          "type": "u64"
        },
        {
          "name": "per_account_timeout_s",
          "type": "u64"
        },
        {
          "name": "can_draw_for_s",
          "type": "u64"
        },
        {
          "name": "palette",
          "type": "vector<0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Color>"
        },
        {
          "name": "cost",
          "type": "u64"
        },
        {
          "name": "cost_multiplier",
          "type": "u64"
        },
        {
          "name": "cost_multiplier_decay_s",
          "type": "u64"
        },
        {
          "name": "default_color",
          "type": "0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Color"
        },
        {
          "name": "can_draw_multiple_pixels_at_once",
          "type": "bool"
        },
        {
          "name": "owner_is_super_admin",
          "type": "bool"
        },
        {
          "name": "max_number_of_pixels_per_draw",
          "type": "u64"
        },
        {
          "name": "draw_enabled_for_non_admin",
          "type": "bool"
        }
      ]
    },
    {
      "name": "Color",
      "is_native": false,
      "abilities": [
        "copy",
        "drop",
        "store"
      ],
      "generic_type_params": [],
      "fields": [
        {
          "name": "r",
          "type": "u8"
        },
        {
          "name": "g",
          "type": "u8"
        },
        {
          "name": "b",
          "type": "u8"
        }
      ]
    },
    {
      "name": "Pixel",
      "is_native": false,
      "abilities": [
        "copy",
        "drop",
        "store"
      ],
      "generic_type_params": [],
      "fields": [
        {
          "name": "color",
          "type": "0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146::canvas_token::Color"
        },
        {
          "name": "drawn_at_s",
          "type": "u64"
        }
      ]
    }
  ]
} as const;
