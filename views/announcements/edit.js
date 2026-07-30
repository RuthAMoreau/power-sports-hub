<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Edit Announcement | Power Sports Hub</title>

  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css"
    rel="stylesheet"
  >

  <link rel="stylesheet" href="/css/style.css">
</head>

<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
  <div class="container">

    <a class="navbar-brand" href="/">
      Power Sports Hub
    </a>

    <div class="navbar-nav ms-auto">
      <a class="nav-link" href="/dashboard">Dashboard</a>
      <a class="nav-link" href="/teams">Teams</a>
      <a class="nav-link" href="/players">Players</a>
      <a class="nav-link" href="/events">Schedule</a>
      <a class="nav-link active" href="/announcements">
        Announcements
      </a>
      <a class="nav-link" href="/logout">Logout</a>
    </div>

  </div>
</nav>

<main class="container py-5">

  <div
    class="card shadow-sm mx-auto"
    style="max-width: 750px;"
  >
    <div class="card-body p-4">

      <h1 class="h2">
        Edit Announcement
      </h1>

      <p class="text-muted">
        Update the announcement information.
      </p>

      <% if (error) { %>
        <div class="alert alert-danger">
          <%= error %>
        </div>
      <% } %>

      <form
        action="/announcements/<%= announcement._id %>?_method=PUT"
        method="POST"
      >

        <div class="mb-3">
          <label for="title" class="form-label">
            Title
          </label>

          <input
            type="text"
            class="form-control"
            id="title"
            name="title"
            value="<%= announcement.title || '' %>"
            required
          >
        </div>

        <div class="mb-3">
          <label for="audience" class="form-label">
            Audience
          </label>

          <select
            class="form-select"
            id="audience"
            name="audience"
            required
          >
            <option value="">
              Select an audience
            </option>

            <option
              value="Everyone"
              <%= announcement.audience === "Everyone"
                ? "selected"
                : ""
              %>
            >
              Everyone
            </option>

            <option
              value="Coaches"
              <%= announcement.audience === "Coaches"
                ? "selected"
                : ""
              %>
            >
              Coaches
            </option>

            <option
              value="Parents"
              <%= announcement.audience === "Parents"
                ? "selected"
                : ""
              %>
            >
              Parents
            </option>

            <option
              value="Players"
              <%= announcement.audience === "Players"
                ? "selected"
                : ""
              %>
            >
              Players
            </option>
          </select>
        </div>

        <div class="mb-4">
          <label for="message" class="form-label">
            Message
          </label>

          <textarea
            class="form-control"
            id="message"
            name="message"
            rows="6"
            required
          ><%= announcement.message || "" %></textarea>
        </div>

        <button
          type="submit"
          class="btn btn-primary"
        >
          Save Changes
        </button>

        <a
          href="/announcements"
          class="btn btn-outline-secondary"
        >
          Cancel
        </a>

      </form>

    </div>
  </div>

</main>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>
