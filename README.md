# Ant Food Retrieval

Credit: Daniel Shiffman (https://natureofcode.com/)
Edited by: Asiiah Song
Edited Again by: Julian Cady

My target behavior was ants finding food and bringing it back home.
To do that, ants create pheremone trails once they find food that can lead other ants to the food.
When traveling, ants tend to sorta form lines.
https://www.youtube.com/watch?v=KJXXjwspdhM
https://www.youtube.com/watch?v=3Cs03iM8hG4
https://www.youtube.com/watch?v=WDuRhYhWmkE
https://misfitanimals.com/ants/ant-pheromones/

I wanted the ants to form lines that were fairly effective in getting food home, which they sorta did?
I basically made ants move toward pheremones and if they smelled any, they moved away from home. If they had food, they moved toward home.
Ants leave pheremones if they have food (they also turn bright yellow so I can see them.)
I altered coherence and alignment so that they work at specific angles to make the ants move in a more linelike way.

I would have liked to make them avoid obstacles a little more naturally and prevent them from rapidly turning and spinning,
but I don't know how. I turned down the turning forcemult, but that can only do so much.
