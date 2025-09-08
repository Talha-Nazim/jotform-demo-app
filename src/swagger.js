// swaggerSpec.js
export default {
  openapi: "3.0.0",
  info: {
    title: "JotForm Demo API",
    version: "1.0.0",
    description: "Demo app showcasing two different approaches with JotForm API:\n1. Create a new form directly\n2. Clone and update an existing template form",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  paths: {
    "/create-form": {
      post: {
        summary: "Create a new JotForm form",
        description:
          "Creates a brand-new JotForm form with predefined fields (Name, Email).",
        responses: {
          200: {
            description: "Form created successfully",
            content: {
              "application/json": {
                example: {
                  responseCode: 200,
                  message: "success",
                  content: {
                    id: "252504938729467",
                    title: "My API Created Form",
                    url: "https://form.jotform.com/252504938729467",
                  },
                },
              },
            },
          },
          500: {
            description: "Failed to create form",
          },
        },
      },
    },
    "/forms": {
      get: {
        summary: "Get all forms for the account",
        description: "Fetches all forms available for the API key’s account.",
        responses: {
          200: {
            description: "List of forms",
            content: {
              "application/json": {
                example: {
                  responseCode: 200,
                  content: [
                    {
                      id: "252504938729467",
                      title: "My API Created Form",
                      url: "https://form.jotform.com/252504938729467",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/clone-and-fill": {
      post: {
        summary: "Clone a template form and update fields",
        description:
          "Clones an existing form by ID and replaces placeholder texts with new labels.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  templateFormId: {
                    type: "string",
                    example: "252504582895466",
                  },
                  replacements: {
                    type: "object",
                    example: {
                      "{{NAME}}": "Full Name",
                      "{{EMAIL}}": "Email Address",
                    },
                  },
                },
                required: ["templateFormId", "replacements"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Form cloned and updated successfully",
            content: {
              "application/json": {
                example: {
                  message: "Cloned and updated",
                  newFormUrl: "https://form.jotform.com/1234567890",
                  newFormId: "1234567890",
                },
              },
            },
          },
          400: {
            description: "Bad request (missing parameters)",
          },
          500: {
            description: "Clone/update failed",
          },
        },
      },
    },
  },
};
