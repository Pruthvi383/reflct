export const pricingData = {
  cursor: {
    name: "Cursor",
    plans: {
      pro: {
        name: "Pro",
        pricePerSeat: 20
      },
      business: {
        name: "Business",
        pricePerSeat: 40
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
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 39
      }
    }
  },
  claude: {
    name: "Claude",
    plans: {
      pro: {
        name: "Pro",
        pricePerSeat: 20
      },
      team: {
        name: "Team",
        pricePerSeat: 25,
        minimumSeats: 5
      }
    }
  },
  chatgpt: {
    name: "ChatGPT",
    plans: {
      plus: {
        name: "Plus",
        pricePerSeat: 20
      },
      team: {
        name: "Team",
        pricePerSeat: 25
      }
    }
  },
  gemini: {
    name: "Gemini",
    plans: {
      business: {
        name: "Business",
        pricePerSeat: 20
        // TODO: double-check Gemini business pricing before PRICING_DATA.md.
      }
    }
  },
  windsurf: {
    name: "Windsurf",
    plans: {
      pro: {
        name: "Pro",
        pricePerSeat: 15
      }
    }
  }
} as const;
