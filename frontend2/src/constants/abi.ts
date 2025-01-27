export const ABI = (moduleAddress: string) => ({
  address: moduleAddress,
  name: "canvas_token",
  friends: [],
  exposed_functions: [
    {
      name: "add_admin",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "address",
      ],
      return: [],
    },
    {
      name: "add_to_unlimited_artists",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "address",
      ],
      return: [],
    },
    {
      name: "can_draw_unlimited",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "address",
      ],
      return: ["bool"],
    },
    {
      name: "clear",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
      ],
      return: [],
    },
    {
      name: "clear_contribution_timeouts",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
      ],
      return: [],
    },
    {
      name: "create",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        "0x1::string::String",
        "0x1::string::String",
        "u16",
        "u16",
        "u64",
        "u8",
        "u64",
        "bool",
      ],
      return: [],
    },
    {
      name: "disable_draw_for_non_admin",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
      ],
      return: [],
    },
    {
      name: "draw",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "vector<u16>",
        "vector<u16>",
        "vector<u8>",
      ],
      return: [],
    },
    {
      name: "enable_draw_for_non_admin",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
      ],
      return: [],
    },
    {
      name: "is_admin",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "address",
      ],
      return: ["bool"],
    },
    {
      name: "is_super_admin",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "address",
      ],
      return: ["bool"],
    },
    {
      name: "is_unlimited_artist",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "address",
      ],
      return: ["bool"],
    },
    {
      name: "remove_admin",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "address",
      ],
      return: [],
    },
    {
      name: "remove_from_unlimited_artists",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "address",
      ],
      return: [],
    },
    {
      name: "set_uri",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "0x1::string::String",
      ],
      return: [],
    },
    {
      name: "update_max_number_of_pixels_per_draw",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "u64",
      ],
      return: [],
    },
    {
      name: "update_per_account_timeout",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: [
        "&signer",
        `0x1::object::Object<${moduleAddress}::canvas_token::Canvas>`,
        "u64",
      ],
      return: [],
    },
  ],
  structs: [
    {
      name: "Canvas",
      is_native: false,
      abilities: ["key"],
      generic_type_params: [],
      fields: [
        {
          name: "config",
          type: `${moduleAddress}::canvas_token::CanvasConfig`,
        },
        { name: "pixels", type: "0x1::smart_table::SmartTable<u32, u8>" },
        { name: "last_contribution_s", type: "0x1::table::Table<address, u64>" },
        { name: "unlimited_artists", type: "0x1::table::Table<address, bool>" },
        { name: "admins", type: "0x1::table::Table<address, bool>" },
        { name: "created_at_s", type: "u64" },
        { name: "extend_ref", type: "0x1::object::ExtendRef" },
        { name: "mutator_ref", type: "0x4::token::MutatorRef" },
      ],
    },
    {
      name: "CanvasConfig",
      is_native: false,
      abilities: ["drop", "store"],
      generic_type_params: [],
      fields: [
        { name: "width", type: "u16" },
        { name: "height", type: "u16" },
        { name: "per_account_timeout_s", type: "u64" },
        { name: "default_color", type: "u8" },
        { name: "max_number_of_pixels_per_draw", type: "u64" },
        { name: "draw_enabled_for_non_admin", type: "bool" },
      ],
    },
    {
      name: "TableHolder",
      is_native: false,
      abilities: ["store", "key"],
      generic_type_params: [{ constraints: ["copy", "drop"] }, { constraints: [] }],
      fields: [{ name: "table", type: "0x1::table::Table<T0, T1>" }],
    },
  ],
} as const);
