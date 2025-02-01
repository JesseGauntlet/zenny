Using Langchain / LangSmith / LangFuse, we aim to build the following AI features:

(1) AI Ticket Assistant for Customer Portal
Issue: Customers have trouble creating detailed enough tickets to be useful for the agents.
Solution: Use AI to help customers create detailed tickets.
AI can process the ticket description, and then ask clarifying questions to help the customer create a detailed ticket.

User flow example:
1. Customer enters the new ticket page
2. Customer types in the ticket subject and description
3. AI comes up with list of necessary fields in order to solve the ticket
4. AI checks to see if the customer has provided all the necessary fields
5. If not, AI generates the missing fields for the customer to include
6. Once the AI judge is satisfied, the "Create Ticket" button is enabled

e.g.
  Subject: Need quote on phone repair
  Description: My phone is broken and I need a quote to repair it.

  Clicking create ticket button adds in text fields:

  Subject: Need quote on phone repair
  Description: My phone is broken and I need a quote to repair it.
    Phone Model: ?
    Phone Issue: ?
    Phone Condition: ?

  Red text under "create ticket" button:
  "Please provide a phone model, issue, and condition before creating a ticket"


(2) AutoCRM
What is the worst part of a CRM? Constantly having to click, input, and update forms across multiple objects and screens. This manual updating process can be a huge time sink for teams across industries. What if we used AI to introduce a new way of object data creation and maintenance? 

This feature is called AutoCRM. Imagine this: You login into your CRM dashboard and click an icon to open a chat interface in your right sidebar. You instruct the agent using chat or voice to complete a specific action within your organization. For example, “Add notes to the student record for Christopher Walker based on these meeting notes…” The agent would identify which object needs to be updated, which fields need to be edited specifically within that object, parse clear notes from the context given, identify the tables that need to be updated, call a tool to update Supabase, and show confirmation on screen.
AutoCRM lets users save time by automating data entry and maintenance. Instead of clicking through several windows, scrolling endlessly, and updating forms manually, AutoCRM uses clear directives to do tasks for you. To ensure accuracy, AutoCRM walks through the process step-by-step in your chat window. You can revert the action immediately if it was done incorrectly, check where AutoCRM made a mistake, and give feedback on how to improve next time.


(3) AI ticket classification for Agent Portal
Issue: Agents have trouble classifying tickets into the correct category.
Solution: AI processes the ticket description, assigns a tag, and if the previously tagged support tickets have applicable resolutions, it can automatically suggest a resolution.