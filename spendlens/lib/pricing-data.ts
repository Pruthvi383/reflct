export const pricingData = {
  cursor: {
    name: "Cursor",
    plans: {
      pro: {
        name: "Pro",
        pricePerSeat: 20
      }
    }
  },
  githubCopilot: {
    name: "GitHub Copilot",
    plans: {
      individual: {
        name: "Individual",
        pricePerSeat: 10
      },
      business: {
        name: "Business",
        pricePerSeat: 19
      }
    }
  }
} as const;
