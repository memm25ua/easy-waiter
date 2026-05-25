import type {
  CartItem,
  Menu,
  Order,
  StaffAssignment,
  TableSession,
} from "$lib/types";

export const restaurantA = {
  id: "10000000-0000-0000-0000-000000000001",
  name: "Demo Bistro",
  slug: "demo-bistro",
};

export const restaurantB = {
  id: "10000000-0000-0000-0000-000000000002",
  name: "Sample Cantina",
  slug: "sample-cantina",
};

export const productionOwner: StaffAssignment = {
  id: "staff-owner-a",
  accountId: "00000000-0000-0000-0000-0000000000a1",
  restaurantId: restaurantA.id,
  locationId: "20000000-0000-0000-0000-000000000001",
  role: "owner",
  restaurantName: restaurantA.name,
  locationName: "Demo Bistro Centro",
  currency: "EUR",
};

export const productionSession: TableSession = {
  id: "40000000-0000-0000-0000-000000000001",
  sessionCode: "DEMO-1",
  tableLabel: "Table 1",
  locationId: productionOwner.locationId,
  status: "active",
  openedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
};

export const productionCart: CartItem[] = [
  {
    menuItemId: "item-rice",
    quantity: 1,
    selections: [{ optionId: "option-side", valueIds: ["side-salad"] }],
  },
];

export const productionMenu: Menu = {
  id: "menu-demo",
  locationId: productionOwner.locationId,
  title: "Demo Bistro Menu",
  status: "published",
  publishedAt: new Date().toISOString(),
  sections: [
    {
      id: "section-mains",
      name: "Mains",
      description: "Fresh dishes from the kitchen.",
      sortOrder: 1,
      items: [
        {
          id: "item-rice",
          name: "Chicken Rice",
          description: "Saffron rice with roasted chicken.",
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
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const productionOrder: Order = {
  id: "order-demo-1",
  locationId: productionOwner.locationId,
  tableSessionId: productionSession.id,
  tableLabel: productionSession.tableLabel,
  source: "manual",
  status: "new",
  items: productionCart,
  total: 1450,
  currency: "EUR",
  customerNotes: "",
  staffNotes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
