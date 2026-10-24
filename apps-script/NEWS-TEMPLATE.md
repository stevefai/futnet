# News & events: how a Google Doc becomes a post

Each post is **one Google Doc** in the Drive folder "Futnet Italia – News & events".
To write a post: open the document called **MODEL**, File > Make a copy (Fișier > Creează o copie), keep the copy in the
same folder, rename it, fill it in. The instructions inside the MODEL are in Romanian.

## Rules

- **Order:** newest Doc first, by the Doc's **creation date**. There is no date field to maintain.
- **Event or news:** a post with an **event date** is an event; without one it is news. There is no "type" field.
- **Draft / hiding a post:** there is no published flag. Only Docs directly inside the folder are shown.
  Move a Doc out of the folder (or into a subfolder such as "Ciorne") to hide it. Docs whose name starts with
  "MODEL" or "TEMPLATE" are never shown.

## The document

1. **Details table** (the first table, events only; for news delete the table). Left column = label, right column = value.
   Labels may be written in Romanian, Italian or English (accents and capitals do not matter):

   | label (Romanian) | also accepted | value |
   |---|---|---|
   | Data evenimentului | Data, Data evento, Event date | `14.02.2026` (also `2026-02-14`) |
   | Ora | Ora evento, Event time | `15:00` |
   | Locul | Loc, Locația, Luogo, Place | `Venue, City` |
   | Link | Legătura | optional: Facebook event or any page. Plain text or a clickable link |

2. **One photo** (optional): Insert > Image, on its own line anywhere in the document, wrapped "In line with text".
   Only the first photo is used.
3. **Italiano** section: a line styled **Heading 1** that says `Italiano`, then the title as **Heading 2**, then the text.
4. **English** section: a line styled **Heading 1** that says `English`, then the title as **Heading 2**, then the text.
   If one language is left out, the site shows the other one for both.

Allowed formatting in the text: normal paragraphs, **bold**, *italic*, links, bullet and numbered lists, and extra
Heading 2 / Heading 3 lines for sub-titles. Fonts, colours and sizes are ignored on purpose.

A document that breaks these rules is skipped (or partly read) with a warning in the build log; the rest of the site is not affected.
