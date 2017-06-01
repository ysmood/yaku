# Lazy Tree Structure

> This is how Yaku was piled up.

The base idea of promise is keeping all data and data handlers inside the promise world, promise will help to box them, proxy them and unbox them. You may have already heard of it before, most people like to call it [Monad][]. However, you could follow me to discover another interesting way to have a better understand on what abstraction promise does for you. I call it Lazy Tree, a dynamic tree constructed by promises.

We are already familiar with the tree structure. In functional programming world, expressions domains the world, everything is just a mathematical concept, no need for space and time. But in the real world, things get dirty, we cannot throw the input into a function, and it magically give us the answer as if there's no side effect. The function will consume memory, the CPU will emit some radiation. Promise is something that glues the space, time and the real world.

**Rather than laid on space, a Lazy Tree is a tree that laid on both space and time, it's 4 dimensional (x, y, time and err).**

That's the biggest difference between callback style async flow control and promise. The callback style only define the tree on a 2 dimensional way, append the tree won't grow as time pass by.

The code is complex, to simplify it, let's see some graphics.

Here we have defined some promises. Like below:

```
space-time 01

          p0
       /      \
      p1       p4
    /    \
  p2     p3
```

If promise p1 resolves another promise p5, the tree structure will change to:

```
space-time 02

          p0
       /      \
      p1       p4
      |
      p5
    /    \
  p2      p3
```

There are some interesting constrains of this data structure:

- Each individual promise can only have one settled value.
- Each individual promise can only have one callback to pass the settled value.
- Each individual callback can only produce one promise.
- The only way to link two promise is through the callback.
- After a child is settled, its relation with its parent can be eliminated.

The tree is dynamically modified on runtime. As the dynamic process goes on,
the tree's any node can be extended to any shape, of course it's append only,
you cannot delete node of this tree.

Another interesting thing about promise is that it has a built-in [Maybe Monad][monad],
it's like a wormhole, it's a short-circuit between the rejected node and its children.
Such as on the `space-time 01`, if the p0 rejects, the computation inside its children's
resolvers will be skipped, it won't waste your CPU cycles to reach the other side of the universe.

So the `rejectors` of promise is the third dimension of the Lazy Tree, it helps us to jump between nodes.

[monad]: https://en.wikipedia.org/wiki/Monad_(functional_programming)
