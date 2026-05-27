library(dplyr)
library(ggplot2)
library(recommenderlab)
library(purrr)
library(mltools)
library(data.table)
library(tidyr)
library(tidytext)
library(shinyWidgets)
library(waffle)
library(ggcorrplot)
library(shinythemes)

##### To improve-
#concise into ONE function for all barplots- like it's done for the other plots
#Hover over waffleplot
#create binary matrices and recommenders for all attributes (after processing) in one call only




#Load dataset
taylorSwiftDataset=read.csv("ts.csv")

#Remove song duplicates from dataset
taylorSwiftDataset <- taylorSwiftDataset[order(taylorSwiftDataset[,'name'],-taylorSwiftDataset[,'popularity']),]
taylorSwiftDataset = taylorSwiftDataset[!duplicated(taylorSwiftDataset$name),]

#Options to display to the user - one for songs they like, one for which attribute to display a histogram of.
song_options <- select(taylorSwiftDataset, c('name'))
histogram_options <- c('length', 'popularity', 'danceability', 'acousticness', 'energy', 'instrumentalness', 'liveness', 'loudness', 'speechiness', 'valence', 'tempo')

#Structure of the pages
ui <-fluidPage(theme = shinytheme("superhero"),
               tags$head(tags$style(HTML('* {font-family: "Palatino"};'))),
               
               #Header
               headerPanel('The Shubz-Taylor Swift Recommendation Engine'),
               
               #Main page- sidebar
               sidebarPanel(
                 h5('Hello! '),
                 h5('This is a Taylor Swift based recommender.'),
                 h5("If you've never heard a Taylor Swift song before,"),
                 tagList("please begin by getting cultured here:", url <- a("Anti-Hero by Taylor Swift", href="https://youtu.be/b1kbLwvqugk")),
                 h5("If you have,"),
                 h5("select a song (or songs) by Taylor Swift that you already know and love to find three more for you to go listen to!"),
                 h5("This recommender engine is based on 10 different characteristics* of each song you give it."),
                 selectizeInput('user_songs', 'Search/Choose a TS song/songs', song_options, multiple = TRUE),
                 img(src='ts.jpeg', align = "center"),
                 h5("Here is a picture of Taylor Swift with some awards because why not."),
                 h5("Unfortunately, Taylor's latest album, 'Midnights' is not here because Spotify has not made that data available yet. Also, bonus tracks are not included."),
                 h5("Here are your recommendations:"),
                 tableOutput("selected_app"),
                 h5("Look to the right for some stats and switch tabs for some more stats."),
                 h5("Have fun!"),
                 h5(" "),
                 h6("* The ten characteristics are: popularity, album, tempo, loudness, danceability, acousticness, energy, liveness, speechiness, and valence."),
               ),
               
               
               mainPanel(
                 tags$style(type="text/css",".shiny-output-error { visibility: hidden; }",".shiny-output-error:before { visibility: hidden; }"),
                 tabsetPanel(type = "tabs",
                             
                             #Tab / Page 1 -> Long Story Short
                             tabPanel("Long Story Short", 
                              fluidRow(
                                column(6,plotOutput("song_pop")),
                                column(6,plotOutput("avg_pop_album"))),
                            fluidRow(
                               column(6,plotOutput("danceability_song")),
                               column(6,plotOutput("energy_song"))
                             ),
                             fluidRow(
                               column(6,plotOutput("acousticness_song")),
                               column(6,plotOutput("valence_song"))
                             ),
                            ),
                            
                            #Tab / Page 2 -> Closure
                             tabPanel("Closure", 
                                fluidRow(
                                  column(6,plotOutput("corr_user")),
                                  column(6,plotOutput("corr_taylor"))
                                ),
                                
                                fluidRow(
                                  column(6,plotOutput("waffle"),
                                         img(src='ts3.jpeg', align = "right", style="width: 400px")),
                                  column(6,h5("Pick an attribute and see it summarised across all her songs:"),
                                         selectizeInput('user_hist', 'Choose a feature to plot the histogram.', histogram_options, multiple = FALSE),
                                         plotOutput("feature_histogram"),
                                         h5("Here's another picture of Taylor Swift with some awards at 19 years of age to make you feel like a real failure."),
                                         h5(""),
                                         h5("Fun Fact! At the 2019 American Music Awards, Swift surpassed Michael Jackson's record to become the most awarded artist at the AMAs. She currently has 34.")
                                         )
                                    )
                                ),
                              
                             #Tab / Page 3 -> Dear Reader
                             tabPanel("Dear Reader", 
                                      h5("Here are", url <- a("thirty pieces of great advice from Taylor Swift.", href="https://www.elle.com/culture/celebrities/a26628467/taylor-swift-30th-birthday-lessons/")),
                                      h5("And some more album-wise data, covering all her albums."),
                                      fluidRow(
                                        column(6,plotOutput("album_len")),
                                        column(6,plotOutput("album_tempo"))
                                      ),
                                      img(src='ts4.jpeg', align = "center"),
                                      h5("More awards because Taylor Swift is great and this is my website and I can do whatever I want.")
                                      )
                   
                          )
                 
               )
      )

#Back-End              
server <- function(input,output) {
  
    #return songs entered by user 
    get_inp<-function(input_in){
    selections<-input_in
    return (selections)
    }
  
    #Func to create binary matrix
    create_binary_matrix <- function(taylorSwiftDataset, pred_attr) {
      
      #extract needed feature
      tay_model_attribute <- select(taylorSwiftDataset, c('name',pred_attr)) %>% distinct()
      
      #create binaryRatingMatrix
      tay_model_attribute <- tay_model_attribute %>% mutate(n = 1) %>% pivot_wider(names_from= name, values_from = "n", values_fill = 0)
      tay_model_attribute_binary <- tay_model_attribute %>% 
        select(-pred_attr) %>% 
        as.matrix() %>% 
        as("binaryRatingMatrix")
      
      return(tay_model_attribute_binary)
    }
  
    #create the recommendation engine for each feature
    create_recommender <- function(bin_mat) {
      
      train_scheme <- evaluationScheme(bin_mat, method="split", train=0.8, given = -1)
      rec_engine <- Recommender(bin_mat, "UBCF", param = list(nn=3))
      
      return(rec_engine)
    }
  
    #Given a list of input songs and a rec engine, generate predictions
    use_recommender <- function(user_songs, rec) {
      
      new = taylorSwiftDataset%>% 
        select(name) %>% 
        arrange(name) %>% 
        filter(name %in%  user_songs) %>% 
        rbind(taylorSwiftDataset %>% select(name) %>% distinct()) %>% 
        count(name) %>% 
        mutate(n = n-1) %>% 
        pivot_wider(names_from = 'name', values_from = "n", values_fill = list(n=0)) %>%   
        as.matrix() %>% 
        as("binaryRatingMatrix")
        
        new_songs <- predict(rec, new, n = 3) %>% 
          as("list") %>% 
          as.data.frame()
        
        df <- subset(taylorSwiftDataset, name == new_songs[1,1] | name == new_songs[2,1] | name == new_songs[3,1]) %>% distinct()
        
        return(df)
      
    }
    
    #Plot the danceability of each recommendation
    plot_songwise_attr_danceability <- function(df) {
      
      plot <- ggplot(data=df, aes(x=name, y=danceability, fill=name)) +
        labs(y= "Danceability", x="Your new songs", "title" = "How well can you dance to these tracks? ", 
             "subtitle" = "Based on musical elements including rhythm stability, tempo, beat strength, etc.") +
        geom_bar(stat="identity", position=position_dodge() , width=0.5,  alpha = 0.8) + 
        scale_fill_manual(values=c("#1850c4", "#2b2a65", "#b454b4"))+ 
        theme(legend.position="none", 
              axis.title = element_text(size = 15, color="white"), 
              axis.text = element_text(size = 13, color="white"), 
              plot.title = element_text(size = 15),
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))
      
      return (plot)
    }
    
    #Plot the energy of each recommendation
    plot_songwise_attr_energy<- function(df) {
      
      plot <- ggplot(data=df, aes(x=name, y=energy, fill=name)) +
        labs(y= "Energy", x="Your new songs", "title" = "How energetic are your new recommendations? ", 
             "subtitle" = "Songs with higher energy feel faster, louder, and noisier- they're intense and active.") +
        geom_bar(stat="identity", position=position_dodge() , width=0.5, alpha = 0.8) + 
        scale_fill_manual(values=c("#b56576", "#e56b6f", "#eaac8b"))+ 
        theme(legend.position="none", 
              axis.title = element_text(size = 15, color="white"), 
              axis.text = element_text(size = 13, color="white"), 
              plot.title = element_text(size = 15),
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))
      
      return (plot)
    }
    
    #Plot the acousticness of each recommendation
    plot_songwise_attr_acousticness<- function(df) {
      
      plot <- ggplot(data=df, aes(x=name, y=acousticness, fill=name)) +
        labs(y= "Acousticness", x="Your new songs", "title" = "What do you call a really loud stick that \n tries to overthrow its government?", 
             "subtitle" = "This is a measure of how ACOUSTIC your songs are.") +
        geom_bar(stat="identity", position=position_dodge() , width=0.5, alpha = 0.8) + 
        theme(legend.position="none", 
              axis.title = element_text(size = 15, color="white"), 
              axis.text = element_text(size = 13, color="white"), 
              plot.title = element_text(size = 15),
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))+ 
        scale_fill_manual(values=c("#ee6c4d", "#8f2d56", "#218380"))
      
      return (plot)
    }
    
    #Plot the valence of each recommendation
    plot_songwise_attr_valence<- function(df) {
      
      plot <- ggplot(data=df, aes(x=name, y=valence, fill=name)) +
        labs(y= "Valence", x="Your new songs", "title" = "Are you happy?", 
             "subtitle" = "If yes, you shouldn't be listening to Taylor Swift if you want to stay that way.\nThis is a measure of valence- or musical positiveness conveyed from\nyour tracks.\nA higher valence indicates more positivity.") +
        geom_bar(stat="identity", position=position_dodge() , width=0.5, alpha = 0.8) + 
        theme(legend.position="none", 
              axis.title = element_text(size = 15, color="white"), 
              axis.text = element_text(size = 13, color="white"), 
              plot.title = element_text(size = 18),
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))+  
        scale_fill_manual(values=c("#fb8500", "#ffb703", "#023047"))
      
      return (plot)
    }
    
    #Plot the average of the popularity of all the songs in the albums recommended (which are derived from the songs recommended)
    plot_avg_pop_rec_albums <- function(df) {
      
      df_grp_region = df %>% group_by(album)  %>%
        summarise(avg_popularity = mean(popularity))
      
      plot <- ggplot(data=df_grp_region , aes(x=album, y=avg_popularity, fill=album)) +
        geom_bar(stat="identity", width=0.2, alpha = 0.8)+ 
        scale_fill_manual(values=c("#084c61", "#ffc857", "#00b2ca")) + coord_flip()+
        labs(y= "Popularity", x="Albums of recommended songs", "title" = "You'd like these albums", 
             "subtitle" = "They're all popular (As of December 2022,\nTaylor Swift has the most monthly listeners on Spotify),\nbut here's a relative guide -") +
        theme(legend.position="none", 
              axis.title = element_text(size = 15, color="white"), 
              axis.text = element_text(size = 13, color="white"), 
              plot.title = element_text(size = 18),
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))
      return (plot)
      
    }
    
    #Plot the popularity of recommended songs
    plot_song_popularity <- function(df) {
      
      plot <- ggplot(df , aes(x=name, y=popularity, fill=name)) +
        geom_bar(stat="identity", width=0.2, alpha=0.8)+ coord_flip() +
        labs(y= "Popularity", x="Your new songs", "title" = "Where are your new\nsongs on the charts?", 
             "subtitle" = "(Listen to them regardless)") +
        theme(legend.position="none", 
              axis.title = element_text(size = 15, color="white"), 
              axis.text = element_text(size = 13, color="white"), 
              plot.title = element_text(size = 18),
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))+ 
        scale_fill_manual(values=c("#70d6ff", "#ff70a6", "#ffd670"))
      
      return(plot)
    }
    
    #plot correlation matrix
    plot_corr <- function(df, title, st) {
      
      new_df <- df %>% select(c('length', 'popularity','danceability', 'acousticness', 'energy', 'instrumentalness',
                                                'liveness', 'loudness', 'speechiness', 'valence', 'tempo'))
      corr <- round(cor(new_df), 1)
      plot <-ggcorrplot(corr)+
        labs("title" = title, 
             "subtitle" = st) +
        theme(legend.position="right", 
              axis.title = element_text(size = 15, color="#4b5d6e"), 
              axis.text = element_text(size = 13, color="#4b5d6e"), 
              plot.title = element_text(size = 18),
              text=element_text(family="Palatino", color='#4b5d6e'))
      
      return(plot)
      
    }
    
    #Plot waffle chart showing the number of songs in each recommended (which are derived from the songs recommended)
    plot_albums_waffle_chart <- function(df) {
      
      chosen_albums <- df[,'album']
      chosen_albums <- chosen_albums[!duplicated(chosen_albums)]
      
      df_grp_region = taylorSwiftDataset %>% group_by(album)  %>%
        filter(album %in% chosen_albums) %>% mutate(n = 1) %>% 
        group_by(album) %>% 
        summarise(no_songs = sum(n))
      
      if (length(chosen_albums) == 1){
        a = as.numeric(df_grp_region[1,2])
        x = c('1st Album' = a)
      }
      
      if (length(chosen_albums) == 2){
        
        a = as.numeric(df_grp_region[1,2])
        b = as.numeric(df_grp_region[2,2])
  
        x = c('1st Album' = a, '2nd Album' = b)
      }
      
      if (length(chosen_albums) == 3){
        a = as.numeric(df_grp_region[1,2])
        b = as.numeric(df_grp_region[2,2])
        c = as.numeric(df_grp_region[3,2])
        
        x = c('1st Album' = a, '2nd Album' = b, '3rd Album' = c)
      }
      
      plot<- waffle(x, rows = 6) +
        labs( x="Number of songs in each album recommended to you", "title" = "A composition of the albums you'd like", 
             "subtitle" = "To help you choose which recommended album to start with") +
        theme(legend.position="right", 
  
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))
      
      return(plot)
      
    }
    
    #Plot the average of the length of all the songs in the albums recommended (which are derived from the songs recommended)
    plot_album_len <- function() {
      
      df <- taylorSwiftDataset
      plot <- ggplot(df, aes(x=length, y=album,fill=album))+
        geom_boxplot()+
        geom_point(colour = "#4b5d6e", size = 1) +
        labs(y= "Album name", x="length", title = "Length of albums") +
        theme(legend.position="none", 
              axis.title = element_text(color="white"), 
              axis.text = element_text(color="white"), 
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))
      return(plot)
      
    }
    
    #Plot the average of the tempo of all the songs in the albums recommended (which are derived from the songs recommended)
    plot_album_tempo <- function() {
      
      df <- taylorSwiftDataset
      plot <- ggplot(df, aes(x=tempo, y=album,fill=album))+
        geom_boxplot()+
        geom_point(colour = "#4b5d6e", size = 1) +
        labs(y= "Album name", x="tempo", title = "Tempo of albums") +
        theme(legend.position="none", 
              axis.title = element_text(color="white"), 
              axis.text = element_text(color="white"), 
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))
      
      return(plot)
      
    }
    
    #Plot the histogram for the feature given as input by user
    plot_feature_histogram <- function(feature) {
      
      
      plot <- ggplot(taylorSwiftDataset, aes(x=!! sym(feature))) + 
        geom_histogram(aes(y=..density..), colour="#4b5d6e", fill="white")+
        geom_density(alpha=.2, fill="yellow") +
        geom_vline(aes(xintercept=mean(!! sym(feature))),
                   color="hotpink", linetype="longdash", linewidth=1) + 
        labs(x= as.character((feature)), y="Count", title = "Here's a summary:") +
        theme(legend.position="none", 
              axis.title = element_text(color="white"), 
              axis.text = element_text(color="white"), 
              text=element_text(family="Palatino", color='white'),
              plot.background =
                element_rect(fill = "#4b5d6e"))
      
      return(plot)
      
    }
      
  
  #Select variables based on which our recommender will recommend
  tay_model_variables <- select(taylorSwiftDataset, c('name','popularity', 'album')) %>% distinct()
  
  #First process 'popularity'
  popularity_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "popularity")
  
  #process 'album'
  album_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "album")
  
  #process 'tempo'
  tempo_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "tempo")
  
  #Create recommender for 'popularity'
  rec_engine_pop <- create_recommender(popularity_binary_matrix)
  
  #Create recommender for 'album'
  rec_engine_album <- create_recommender(album_binary_matrix)
  
  #Create recommender for 'tempo'
  rec_engine_tempo <- create_recommender(tempo_binary_matrix)
  
  #create second dataset with rounded values for the other features (numerical)
  taylorSwiftDataset_rounded <- taylorSwiftDataset %>% select('danceability', 'acousticness', 'energy', 'liveness',
                                                              'speechiness', 'valence') %>% mutate_all(round, as.numeric(1)) 
  
  taylorSwiftDataset_rounded$name <- taylorSwiftDataset$name
  
  #special dataset for loudness- we want no decimals because of variations in values.
  taylorSwiftDataset_loudness <- taylorSwiftDataset %>% select('loudness') %>% mutate_all(round, 0)
  
  taylorSwiftDataset_loudness$name <- taylorSwiftDataset$name
  
  #process 'loudness'
  loudness_binary_matrix <- create_binary_matrix(taylorSwiftDataset_loudness, "loudness")
  
  #process 'danceability'
  danceability_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "danceability")
  
  #process 'acousticness'
  acousticness_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "acousticness")
  
  #process 'energy'
  energy_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "energy")
  
  #process 'liveness'
  liveness_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "liveness")
  
  #process 'speechiness'
  speechiness_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "speechiness")
  
  #process 'valence'
  valence_binary_matrix <- create_binary_matrix(taylorSwiftDataset, "valence")
  
  
  #Create recommender for 'loudness'
  rec_engine_loudness <- create_recommender(loudness_binary_matrix)
  
  #Create recommender for 'danceability'
  rec_engine_danceability <- create_recommender(danceability_binary_matrix)
  
  #Create recommender for 'acousticness'
  rec_engine_acousticness <- create_recommender(acousticness_binary_matrix)
  
  #Create recommender for 'energy'
  rec_engine_energy <- create_recommender(energy_binary_matrix)
  
  #Create recommender for 'liveness'
  rec_engine_liveness <- create_recommender(liveness_binary_matrix)
  
  #Create recommender for 'speechiness'
  rec_engine_speechiness <- create_recommender(speechiness_binary_matrix)
  
  #Create recommender for 'valence'
  rec_engine_valence <- create_recommender(valence_binary_matrix)
  
  
  #Create hybrid recommender with all attributes
  taylorSwiftRecommender <- HybridRecommender(rec_engine_pop, rec_engine_album, rec_engine_tempo, rec_engine_loudness,
                                              rec_engine_danceability, rec_engine_acousticness, rec_engine_energy, 
                                              rec_engine_liveness, rec_engine_speechiness, rec_engine_valence)
  

  #Display recommended songs to user
  output$selected_app <- renderTable({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    recout[,c(2,3,5)]
    
  })
  
  #Display danceability graph
  output$danceability_song <- renderPlot({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    plot <- plot_songwise_attr_danceability(recout)
    plot
    
    
  })
  
  #Display energy graph
  output$energy_song <- renderPlot({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    plot <- plot_songwise_attr_energy(recout)
    plot
    
    
  })
  
  #Display acousticness graph
  output$acousticness_song <- renderPlot({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    plot <- plot_songwise_attr_acousticness(recout)
    plot
    
  })
  
  #Display valence graph
  output$valence_song <- renderPlot({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    plot <- plot_songwise_attr_valence(recout)
    plot
    
  })
  
  #Show popularity of recommended songs
  output$song_pop <- renderPlot({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    plot <- plot_song_popularity(recout)
    plot
    
  })
  
  #display popularity of albums
  output$avg_pop_album <- renderPlot({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    plot <- plot_avg_pop_rec_albums(recout)
    plot
    
  })
  
  #Display correlation matrix - Taylor Swift's entire discography
  output$corr_taylor <- renderPlot({
    
    plot <- plot_corr(taylorSwiftDataset, "How do the features in Taylor Swift's\nentire discography correlate\nwith each other?",
                      "Compare them with your recommendations!")
    plot
    
  })
  
  #Display correlation matrix - For user recommended songs
  output$corr_user <- renderPlot({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    plot <- plot_corr(recout, "How do the features in your\nrecommended songs correlate\nwith each other?",
                      "Other than the obvious and the ones you already know,\nspeechiness refers to the the degree her excellent lyricism\ndominates the songs, and liveness denotes the liklihood\nthat a live audience was present while recording.")
    plot
    
  })
  
  #Waffle plot of number of songs in each recommended album (derived from recommended songs)
  output$waffle <- renderPlot({
    
    recout<-use_recommender(input$user_songs, taylorSwiftRecommender)
    plot <- plot_albums_waffle_chart(recout)
    plot
    
  })
  
  #Histogram of feature as requested by the user
  output$feature_histogram <- renderPlot({
    
    recout<-input$user_hist
    plot <- plot_feature_histogram(recout)
    plot
    
  })
  
  #Plot length of album boxplot
  output$album_len <- renderPlot({
    
    plot <- plot_album_len()
    plot
    
  })
  
  #Plot tempo of album boxplot
  output$album_tempo <- renderPlot({
    
    plot <- plot_album_tempo()
    plot
    
  })
  
  
}

shinyApp(ui = ui, server = server)
