# Shubz-Taylor Swift Recommendation Engine

**Live:** [shubz.shinyapps.io/shubz-taylor-rec-engine-folder](https://shubz.shinyapps.io/shubz-taylor-rec-engine-folder/)

A Taylor Swift song recommender built in R. Select songs from her discography that you already like, get three new recommendations, and explore visualizations breaking down why those songs were chosen — across danceability, energy, acousticness, valence, popularity, and more.

Built in late 2022.

---

## How It Works

The recommender builds 10 separate User-Based Collaborative Filtering (UBCF) models using `recommenderlab` — one per audio feature — then merges all 10 into a single `HybridRecommender`. At query time, the user's selected songs are encoded as a binary vector and passed to the hybrid model to produce 3 recommendations.

| Feature | Notes |
|---------|-------|
| Popularity | Spotify popularity score |
| Album | Album membership |
| Tempo | BPM |
| Loudness | Discretised to whole numbers to reduce sparsity |
| Danceability | |
| Acousticness | |
| Energy | |
| Liveness | |
| Speechiness | |
| Valence | Musical positiveness (0 = sad, 1 = happy) |

Each feature is converted into a `binaryRatingMatrix` and trained with UBCF (`nn=3`, 80/20 train split via `evaluationScheme`).

---

## UI

Three-tab R Shiny interface (superhero theme):

**Long Story Short**
Bar charts for danceability, energy, acousticness, valence, and popularity of your three recommended songs.

**Closure**
Correlation matrices comparing your recommended songs vs. Taylor's full discography, a waffle chart of album composition, and a histogram explorer across all 11 audio features.

**Dear Reader**
Album-level boxplots for track length and tempo across her full discography.

---

## Running Locally

```r
install.packages(c(
  "shiny", "dplyr", "ggplot2", "recommenderlab", "purrr",
  "mltools", "data.table", "tidyr", "tidytext", "shinyWidgets",
  "waffle", "ggcorrplot", "shinythemes"
))

shiny::runApp("app.r")
```

---

## Data

`ts.csv` — Taylor Swift's full discography as of late 2022. Midnights excluded (Spotify had not released that data at the time). Bonus tracks not included.

---

## Stack

R · R Shiny · recommenderlab · ggplot2 · tidyverse · data.table · ggcorrplot · waffle

---

## License

[MIT](LICENSE)
