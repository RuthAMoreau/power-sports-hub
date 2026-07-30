<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title><%= team.teamName %> | Power Sports Hub</title>

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

    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <div
      class="collapse navbar-collapse"
      id="navbarNav"
    >

      <div class="navbar-nav ms-auto">

        <a class="nav-link" href="/dashboard">
          Dashboard
        </a>

        <a
          class="nav-link active"
          href="/teams"
          aria-current="page"
        >
          Teams
        </a>

        <a class="nav-link" href="/players">
          Players
        </a>

        <a class="nav-link" href="/events">
          Schedule
        </a>

        <a class="nav-link" href="/announcements">
          Announcements
        </a>

        <a class="nav-link" href="/logout">
          Logout
        </a>

      </div>

    </div>

  </div>
</nav>

<main class="container py-5">

  <div
    class="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-4"
  >

    <div>

      <h1 class="mb-2">
        <%= team.teamName %>
      </h1>

      <p class="text-muted mb-1">
        <strong>Age Group:</strong>
        <%= team.ageGroup %>
      </p>

      <p class="text-muted mb-1">
        <strong>Season:</strong>
        <%= team.season %>
      </p>

      <p class="text-muted mb-0">
        <strong>Coach:</strong>

        <% if (team.coach) { %>

          <%= team.coach.firstName %>
          <%= team.coach.lastName %>

        <% } else { %>

          Not assigned

        <% } %>
      </p>

    </div>

    <% if (
      user &&
      (
        user.role === "admin" ||
        user.role === "coach"
      )
    ) { %>

      <div class="d-flex flex-wrap gap-2">

        <a
          href="/players/new?team=<%= team._id %>"
          class="btn btn-primary"
        >
          Add Player
        </a>

        <a
          href="/teams/<%= team._id %>/edit"
          class="btn btn-outline-primary"
        >
          Edit Team
        </a>

        <a
          href="/events/new?team=<%= team._id %>"
          class="btn btn-outline-success"
        >
          Schedule Event
        </a>

        <% if (user.role === "admin") { %>

          <form
            action="/teams/<%= team._id %>?_method=DELETE"
            method="POST"
            onsubmit="return confirm('Delete this team and all related players and events?');"
          >

            <button
              type="submit"
              class="btn btn-outline-danger"
            >
              Delete Team
            </button>

          </form>

        <% } %>

      </div>

    <% } %>

  </div>

  <div class="card shadow-sm">

    <div class="card-body">

      <div
        class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3"
      >

        <h2 class="h4 mb-0">
          Team Roster
        </h2>

        <span class="badge text-bg-primary">
          <%= players.length %>
          Player<%= players.length === 1 ? "" : "s" %>
        </span>

      </div>

      <% if (!players || players.length === 0) { %>

        <div class="alert alert-info mb-0">

          No players have been added to this team yet.

          <% if (
            user &&
            (
              user.role === "admin" ||
              user.role === "coach"
            )
          ) { %>

            <a
              href="/players/new?team=<%= team._id %>"
              class="alert-link"
            >
              Add the first player.
            </a>

          <% } %>

        </div>

      <% } else { %>

        <div class="table-responsive">

          <table class="table table-striped table-hover align-middle">

            <thead>

              <tr>
                <th scope="col">Number</th>
                <th scope="col">Player</th>
                <th scope="col">Position</th>
                <th scope="col">Parent / Guardian</th>
                <th scope="col">Email</th>

                <% if (
                  user &&
                  (
                    user.role === "admin" ||
                    user.role === "coach"
                  )
                ) { %>

                  <th scope="col">
                    Actions
                  </th>

                <% } %>

              </tr>

            </thead>

            <tbody>

              <% players.forEach(player => { %>

                <tr>

                  <td>
                    <%= player.jerseyNumber ?? "—" %>
                  </td>

                  <td>
                    <strong>
                      <%= player.firstName %>
                      <%= player.lastName %>
                    </strong>
                  </td>

                  <td>
                    <%= player.position || "—" %>
                  </td>

                  <td>
                    <%= player.parentName || "—" %>
                  </td>

                  <td>

                    <% if (player.parentEmail) { %>

                      <a href="mailto:<%= player.parentEmail %>">
                        <%= player.parentEmail %>
                      </a>

                    <% } else { %>

                      —

                    <% } %>

                  </td>

                  <% if (
                    user &&
                    (
                      user.role === "admin" ||
                      user.role === "coach"
                    )
                  ) { %>

                    <td>

                      <div class="d-flex flex-wrap gap-2">

                        <a
                          href="/players/<%= player._id %>/edit"
                          class="btn btn-sm btn-outline-primary"
                        >
                          Edit
                        </a>

                        <% if (user.role === "admin") { %>

                          <form
                            action="/players/<%= player._id %>?_method=DELETE"
                            method="POST"
                            onsubmit="return confirm('Delete this player from the roster?');"
                          >

                            <button
                              type="submit"
                              class="btn btn-sm btn-outline-danger"
                            >
                              Delete
                            </button>

                          </form>

                        <% } %>

                      </div>

                    </td>

                  <% } %>

                </tr>

              <% }) %>

            </tbody>

          </table>

        </div>

      <% } %>

    </div>

  </div>

  <div class="mt-4">

    <a
      href="/teams"
      class="btn btn-outline-secondary"
    >
      Back to Teams
    </a>

  </div>

</main>

<script
  src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"
></script>

</body>
</html>
