export type ToolCategory = "code" | "assistant" | "search" | "workspace";

export const pricingData = {
  cursor: {
    name: "Cursor",
    category: "code",
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
    category: "code",
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
    category: "assistant",
    plans: {
      pro: {
        name: "Pro",
        pricePerSeat: 20
      },
      team: {
        name: "Team",
        pricePerSeat: 25,
        minimumSeats: 5
      },
      api: {
        name: "API",
        pricePerSeat: 0,
        usageBased: true
      }
    }
  },
  chatgpt: {
    name: "ChatGPT",
    category: "assistant",
    plans: {
      plus: {
        name: "Plus",
        pricePerSeat: 20
      },
      team: {
        name: "Team",
        pricePerSeat: 25
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 0,
        custom: true
      }
    }
  },
  gemini: {
    name: "Gemini",
    category: "assistant",
    plans: {
      business: {
        name: "Business",
        pricePerSeat: 14
        // Google moved Gemini into Workspace tiers; this uses Business Standard.
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 0,
        custom: true
      }
    }
  },
  windsurf: {
    name: "Windsurf",
    category: "code",
    plans: {
      pro: {
        name: "Pro",
        pricePerSeat: 20
      },
      teams: {
        name: "Teams",
        pricePerSeat: 40
      }
    }
  },
  perplexity: {
    name: "Perplexity",
    category: "search",
    plans: {
      pro: {
        name: "Pro",
        pricePerSeat: 20
      }
    }
  },
  notionAi: {
    name: "Notion AI",
    category: "workspace",
    plans: {
      addon: {
        name: "Add-on",
        pricePerSeat: 10
      }
    }
  }
} as const;

export type SupportedTool = keyof typeof pricingData;

export function getToolName(toolId: string) {
  return pricingData[toolId as SupportedTool]?.name ?? toolId;
}
