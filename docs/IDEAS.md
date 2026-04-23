# Ideas

1. [X] We need the journals to correctly link the items / actors that are mentioned
   -> [X] Character Sheet inserts should open said NPC sheet
   -> [X] Item mentions should also open said item document

2. [] Narcovi's Notebook should be a custom Journal class that has cursive on parchment paper
   -> [] This could be made a journal that has a macro the GM presses and it changes the permission to be viewable for the players and shows the logged in players
   -> [] The journal should have a switch to turn off cursive for the reader for readability

3. [] Fix the webm map that's loading in weird
   -> [X] I've made a temporary image so that the map still work but we need to figure out why it's not playing
   ~ It looks like Foundry request the first range of the stream and that causes a 206 partial content error. This will likely take re-encoding.. :(

4. [] Add levels compatibility for V14 Foundry
   -> [] Add pipeline to removes level info on the maps and create two base folders "Maps" / "Maps for Low Performance"

5. [] Change the zone that teleports you into the mind trap to use the new Scene Regions API for V14 with a fallback for V13 (prolly a tile or something)
