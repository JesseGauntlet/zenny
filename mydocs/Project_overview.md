**Summary of Key Points**

- **Project Overview:**
  - The next project is building a **ticket management/customer relationship system** ("Auto CRM") similar to Zendesk, leveraging AI (especially LLMs) to automate repetitive tasks.
  - This project follows the same structure as the previous one: an **MVP** is due early (with a focus on core scaffolding and basic features), and a **full rebuild** with more advanced/production-grade capabilities is due by the end of the week.
  - The MVP deadline is **tomorrow**, with more features required by Friday.

- **Technical Requirements:**
  - **Required tech stack**: 
    1. **React** for the front end.
    2. **Supabase** (for auth, database, storage).
    3. **Cursor** (using its "Cursor Agent" or AI capabilities).
  - **Strongly recommended** but not strictly required:
    - **AWS Amplify** for hosting and CI/CD.
    - **LangChain** for chaining LLM calls (though you can implement your own solutions).
  - Additional possibilities (not mandatory) include:
    - Other frameworks or libraries (e.g., you could use Pinecone for vector storage or different LLM providers), but you must meet the **React + Superbase + Cursor** baseline.

- **Project Requirements & Guidance:**
  - Focus first on **core CRM/ticketing** features: 
    - E.g., user ticket submission, agent interfaces, admin/supervisor dashboards.
  - In the second phase, layer in **AI features** (e.g., summarizing tickets, auto-responses).
  - The team will update the "tests to pass" (production metrics like concurrency, etc.) soon.

**Next Steps**

1. **Set Up Your Tech Stack**  
   - Ensure you have **React**, **Supabase**, and **Cursor** integrated.  
   - Optionally set up **AWS Amplify** for hosting/CI.

2. **Build the Core MVP**  
   - Scaffold a basic ticketing system that can:
     - Let users submit tickets.
     - Show agents a list of incoming tickets.
     - Possibly allow some basic categorization or status updates.
   - Connect to Supabase for auth, roles (user/agent/admin), and ticket data storage.

3. **Incorporate Basic AI / LLM Calls**  
   - If time allows in the MVP stage, demonstrate a simple AI feature (e.g., summarizing ticket content). You can refine or expand AI capabilities later in the week.

4. **Prepare for Production-Grade Enhancements**  
   - Expect added "tests to pass" soon (e.g., concurrency targets).
   - Plan for more advanced features in the second part of the week, such as:
     - Additional RAG workflows (knowledge base retrieval).
     - Auto-tagging or auto-response generation.
     - Observability/tracing with LangSmith or logs.
