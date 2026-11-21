# Architecture Diagram - Backend Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FROZEN LUNAR ARCHITECTURE                       │
│                         After Backend Integration                        │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐    │
│  │  Quote Wizard   │  │  Support Chat    │  │  Admin Dashboard     │    │
│  │  (Form)         │  │  (AI Assistant)  │  │  /admin/*            │    │
│  │  /devis         │  │                  │  │                      │    │
│  └────────┬────────┘  └────────┬─────────┘  └──────────┬───────────┘    │
│           │                    │                        │                │
│           │                    │                        │                │
│           └────────────────────┴────────────────────────┘                │
│                                │                                          │
└────────────────────────────────┼──────────────────────────────────────────┘
                                 │
                                 │ Server Actions
                                 │
┌────────────────────────────────┼──────────────────────────────────────────┐
│                        SERVER ACTIONS LAYER                                │
├────────────────────────────────┼──────────────────────────────────────────┤
│                                │                                            │
│    /src/app/actions/quote-management.ts                                    │
│                                                                             │
│    ┌─────────────────────────────────────────────────────────────────┐    │
│    │  ✓ createQuoteAction(data)                                      │    │
│    │    → Validates with Zod                                         │    │
│    │    → Creates Quote + QuoteHistory                               │    │
│    │    → Returns formatted response                                 │    │
│    │                                                                  │    │
│    │  ✓ getQuotesAction(filters)                                     │    │
│    │    → Fetches with Prisma where clause                           │    │
│    │    → Includes history relation                                  │    │
│    │    → Converts enums to frontend format                          │    │
│    │                                                                  │    │
│    │  ✓ getQuoteByIdAction(id)                                       │    │
│    │  ✓ updateQuoteAction(id, data)                                  │    │
│    │  ✓ updateQuoteStatusAction(id, status)                          │    │
│    │  ✓ deleteQuoteAction(id)                                        │    │
│    │  ✓ addQuoteNoteAction(id, note)                                 │    │
│    └─────────────────────────────────────────────────────────────────┘    │
│                                │                                            │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                                 │ Prisma ORM
                                 │
┌────────────────────────────────┼────────────────────────────────────────────┐
│                           DATABASE LAYER                                    │
├────────────────────────────────┼────────────────────────────────────────────┤
│                                │                                             │
│                     PostgreSQL Database                                     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          TABLES                                      │  │
│  │                                                                      │  │
│  │  ┌─────────────────┐      ┌─────────────────────┐                  │  │
│  │  │     quote       │      │   quote_history     │                  │  │
│  │  ├─────────────────┤      ├─────────────────────┤                  │  │
│  │  │ id              │◄─────│ quoteId (FK)        │                  │  │
│  │  │ date            │      │ action              │                  │  │
│  │  │ clientName      │      │ description         │                  │  │
│  │  │ email           │      │ timestamp           │                  │  │
│  │  │ phone           │      │ user                │                  │  │
│  │  │ itemType        │      └─────────────────────┘                  │  │
│  │  │ pickupLocation  │                                                │  │
│  │  │ dropoffLocation │      ┌─────────────────────┐                  │  │
│  │  │ transportDate   │      │     user            │                  │  │
│  │  │ status (enum)   │      ├─────────────────────┤                  │  │
│  │  │ amount          │      │ id                  │                  │  │
│  │  │ userNotes       │      │ email               │                  │  │
│  │  │ source (enum)   │      │ name                │                  │  │
│  │  │ supplementaryInfo│     │ role                │                  │  │
│  │  └─────────────────┘      │ ... (auth fields)   │                  │  │
│  │                           └─────────────────────┘                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW EXAMPLES                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. CREATE QUOTE (From Form)
   ═══════════════════════════
   
   User fills form at /devis
         │
         ↓
   QuoteWizard.onSubmit()
         │
         ↓
   createQuoteAction({
     clientName: "...",
     email: "...",
     source: "form"
   })
         │
         ↓
   Prisma creates Quote + History
         │
         ↓
   Returns { success: true, quote }
         │
         ↓
   Show success dialog to user


2. CREATE QUOTE (From Chat)
   ═══════════════════════════
   
   User chats with assistant
         │
         ↓
   Guided Q&A flow collects data
         │
         ↓
   useSupportChat calls createQuoteAction({
     clientName: "...",
     source: "chat",
     supplementaryInfo: {...}
   })
         │
         ↓
   Same flow as form
         │
         ↓
   Shows quote ID in chat


3. VIEW QUOTES (Admin)
   ═══════════════════════════
   
   Admin visits /admin/quotes
         │
         ↓
   Page calls getQuotesAction()
         │
         ↓
   Prisma fetches all quotes with history
         │
         ↓
   Converts enums ("PENDING" → "En attente")
         │
         ↓
   Returns formatted quotes array
         │
         ↓
   Table displays quotes


4. UPDATE STATUS
   ═══════════════════════════
   
   Admin clicks "Valider"
         │
         ↓
   QuoteDetailsSheet calls
   updateQuoteStatusAction(id, "Validé")
         │
         ↓
   Converts to enum (VALIDATED)
         │
         ↓
   Prisma updates quote.status
         │
         ↓
   Creates history entry
         │
         ↓
   Revalidates paths
         │
         ↓
   UI refreshes automatically


┌─────────────────────────────────────────────────────────────────────────────┐
│                            TYPE CONVERSIONS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend → Backend:
═════════════════════
client          → clientName
type            → itemType  
pickup          → pickupLocation
dropoff         → dropoffLocation
"En attente"    → QuoteStatus.PENDING
"Validé"        → QuoteStatus.VALIDATED
"Refusé"        → QuoteStatus.REJECTED
"form"          → QuoteSource.FORM
"chat"          → QuoteSource.CHAT

Backend → Frontend:
═════════════════════
clientName      → client
itemType        → type
pickupLocation  → pickup
dropoffLocation → dropoff
PENDING         → "En attente"
VALIDATED       → "Validé"
REJECTED        → "Refusé"
FORM            → "form"
CHAT            → "chat"


┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY & VALIDATION                               │
└─────────────────────────────────────────────────────────────────────────────┘

✓ Zod validation on all inputs
✓ SQL injection prevented by Prisma
✓ Type-safe operations
✓ Server-side validation
✓ Proper error handling
⚠ TODO: Add authentication checks
⚠ TODO: Add rate limiting


┌─────────────────────────────────────────────────────────────────────────────┐
│                             ERROR HANDLING                                   │
└─────────────────────────────────────────────────────────────────────────────┘

All server actions follow this pattern:

try {
  // Validate input with Zod
  const validated = schema.parse(data);
  
  // Perform database operation
  const result = await prisma....;
  
  // Revalidate paths
  revalidatePath("/admin/quotes");
  
  // Return success
  return { success: true, data: result };
  
} catch (error: unknown) {
  console.error("Operation Error:", error);
  
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  
  return { success: false, error: "Unknown error" };
}
```
