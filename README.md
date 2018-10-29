# robbyRobot-route-finder
code for a coding puzzle

robbyRobot.js
=============

A first attempt and slight clunky cell coord system. Route finding uses a Djikstra type algorithm
Worked on tests but failed on large coord sets and datasets


robbyRobot2.js
=============

A second attempt that uses a better coordinate system and has optimisations in place:

1. function calls removed from loops and inlined
1. most variable assingments removed from loops and cached using ```let``` variables

around x2 increase but the large dataset is still too big - taking too long


robbyRobot3.js
=============

A* route finding algorithm added with 'manahattan' heuristic for fast distance calculation

Around x2 increase in speed but still not enough.

The tests are all passing but it's taking too long


robbyRobot4.js (work in progress!)
==================================

I ran out of allocated time for this but this is a half working Binary Heap (min-heap) implementation - not fully working but much faster (another x2.5).

However, still not fast enough...


