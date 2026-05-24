import type { Menu, Order, StaffAssignment, TableSession } from "$lib/types";

export const demoStaff: StaffAssignment = {
  id: "staff-demo",
  restaurantId: "restaurant-demo",
  locationId: "location-demo",
  role: "manager",
  restaurantName: "Demo Bistro",
  locationName: "Demo Bistro Centro",
  currency: "EUR",
};

export const demoMenu: Menu = {
  id: "menu-demo",
  locationId: demoStaff.locationId,
  title: "Demo Bistro Menu",
  status: "published",
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: "section-starters",
      name: "Starters",
      description: "Small plates for the table.",
      sortOrder: 1,
      items: [
        {
          id: "item-toast",
          name: "Tomato Toast",
          description: "Grilled bread with tomato, olive oil, and sea salt.",
          price: 550,
          currency: "EUR",
          dietaryTags: ["vegetarian"],
          allergenNotes: "Contains gluten",
          isAvailable: true,
          sortOrder: 1,
          options: [],
          confidenceFlags: [],
          suggestions: ["Mention local tomatoes when in season."],
        },
        {
          id: "item-croquettes",
          name: "Ham Croquettes",
          description: "Creamy croquettes with cured ham.",
          price: 720,
          currency: "EUR",
          dietaryTags: [],
          allergenNotes: "Contains gluten and dairy",
          isAvailable: false,
          sortOrder: 2,
          options: [],
        },
      ],
    },
    {
      id: "section-mains",
      name: "Mains",
      description: "Fresh dishes from the kitchen.",
      sortOrder: 2,
      items: [
        {
          id: "item-rice",
          name: "Chicken Rice",
          description:
            "Saffron rice with roasted chicken and seasonal vegetables.",
          price: 1450,
          currency: "EUR",
          dietaryTags: [],
          allergenNotes: "",
          isAvailable: true,
          sortOrder: 1,
          options: [
            {
              id: "option-side",
              name: "Side",
              isRequired: true,
              minChoices: 1,
              maxChoices: 1,
              values: [
                {
                  id: "side-salad",
                  name: "Green salad",
                  priceDelta: 0,
                  isAvailable: true,
                },
                {
                  id: "side-potatoes",
                  name: "Lemon potatoes",
                  priceDelta: 150,
                  isAvailable: true,
                },
              ],
            },
          ],
        },
        {
          id: "item-seabass",
          name: "Grilled Sea Bass",
          description: "Sea bass with lemon potatoes and green salad.",
          price: 1890,
          currency: "EUR",
          dietaryTags: ["fish"],
          allergenNotes: "Contains fish",
          isAvailable: true,
          sortOrder: 2,
          options: [],
        },
      ],
    },
  ],
};

export const demoSession: TableSession = {
  id: "session-demo-1",
  sessionCode: "DEMO-1",
  tableLabel: "Table 1",
  locationId: demoStaff.locationId,
  status: "active",
  openedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
};

export const demoOrders: Order[] = [
  {
    id: "order-demo-1",
    locationId: demoStaff.locationId,
    tableSessionId: demoSession.id,
    tableLabel: demoSession.tableLabel,
    source: "manual",
    status: "new",
    items: [{ menuItemId: "item-toast", quantity: 2, selections: [] }],
    total: 1100,
    currency: "EUR",
    customerNotes: "Olive oil on the side.",
    staffNotes: "",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "order-demo-2",
    locationId: demoStaff.locationId,
    tableSessionId: demoSession.id,
    tableLabel: demoSession.tableLabel,
    source: "ai",
    status: "preparing",
    items: [
      {
        menuItemId: "item-rice",
        quantity: 1,
        selections: [{ optionId: "option-side", valueIds: ["side-salad"] }],
      },
    ],
    total: 1450,
    currency: "EUR",
    customerNotes: "Recommended by AI waiter.",
    staffNotes: "",
    createdAt: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];
