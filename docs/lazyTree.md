# Lazy Tree Structure

The base idea of promise is keeping all data and data handler inside the promsie container,
promsie will help box them, proxy them and unbox them. But this isn't all, you have to know
another interesting idae to full understand what abstraction does promise do for you. I call
it Lazy Tree, a dynamic tree constructed by promises.

The code is complex, to simplify it, let's see some graphics.

Here we have defined some promises. Like below:

```
         p0
      /      \
     p1       p4
   /    \
  p2     p3
```

If promise p1 resolves another promise p5, the tree structure will change to:

```
          p0
       /      \
      p1       p4
      |
      p5
    /    \
  p2     p3
```

The tree is dynamically modified on runtime. As the dynamic process goes on,
the tree's any node can be extended to any shape, of course it's append only,
you cannot delete node of this tree.

To be continued...