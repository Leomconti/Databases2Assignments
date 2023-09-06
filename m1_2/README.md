# Usando o HTMX no front

## 1. Load the tables to select

-   we make a onLoad request to get the tables from the backend

```html
hx-get="/tables" 
hx-trigger="load"
hx-on="htmx:afterOnLoad" 
hx-swap="outerHTML"
```

## 2. Get table headers

-   once the tables are retrieved, we swap the html for the new select that came from the backend

-   the new select contains another htmx which will get onChange the headers for the table

## 3. Get table data

### 3.1 From Search

-   from search we use the **keyup**, to fetch constantly as words come to play, to not send too many requests while typing, it's only made **after half a second of not typing**

```html
hx-post="/search" 
hx-trigger="keyup delay:500ms"
hx-target="#searchResults" 
hx-vars="table:selectTable.value"
```

### 3.2 From Button

-   button fetches all of the data and populates the table on click
-   we send the selected table with the request
-   maybe we can set pagination later on...

```html
class="btn btn-secondary mb-3"
hx-post="/list" hx-trigger="click" 
hx-target="#searchResults"
hx-vars="table:selectTable.value"
```
