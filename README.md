# LireLibre 📚

LireLibre is a web app for organizing your reading life. Discover books, keep track of your progress, share your thoughts, and connect with other readers.

Book information comes from Open Library, while authentication and data are managed by Supabase.

## Features

- **Book discovery** — Search the Open Library catalog by title, author, or ISBN.
- **Personal library** — Organize books into Want to Read, Currently Reading, and Finished shelves.
- **Reading progress** — Track your current page and completed books.
- **Ratings and reviews** — Rate books on a five-star scale and write or edit your reviews.
- **Custom lists** — Create collections and choose whether to make them public.
- **Reading goals** — Set an annual target and follow your progress.
- **Reader profiles** — Personalize your name, bio, and profile picture.
- **Followers** — Follow other readers and browse follower and following lists.
- **Privacy controls** — Choose whether your profile and lists are public or private.

## Tech Stack

| Area           | Technologies                          |
| -------------- | ------------------------------------- |
| Frontend       | React, Next.js App Router, TypeScript |
| Styling        | Tailwind CSS, React Icons             |
| Backend        | Next.js Route Handlers                |
| Authentication | Supabase Auth                         |
| Database       | Supabase PostgreSQL                   |
| Book catalog   | Open Library API                      |

## Privacy and Access

Database access is protected by Row Level Security. Users can manage their own library, lists, ratings, and reviews, while public content is available according to profile visibility.

Following a reader does not grant access to their private content.

## About the Project

LireLibre brings book discovery, personal organization, and a reading community together in one place. Version 1.0 uses Supabase for authentication and database services, replacing the previous Docker setup and custom authentication system.

---

Book data and cover images are provided by [Open Library](https://openlibrary.org/).
