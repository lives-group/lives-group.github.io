# Introducing Gradual Typing

If you got interested in gradually typed systems, but don't know where to start reading, this post is just for you. Only basic programming knowledge is assumed.

## Playing with Types

Programming languages are constantly evolving and allowing more expressivity when writing programs, while also providing more guaranties for software developers. One of the gifts of these evolutions is being able to avoid invalid or undefined behaviour, by classifying the software's components according to the values they compute. We're talking about **types**. An element's type tell us what kind of operations can be done consistently with the element, and a **Type System** is basically a set of rules regarding types. Take a look on the examples below:

```haskell
sum :: Int -> Int -> Int
sum x y = x + y
```

```python
def sum (x, y):
    return x + y
```

Both examples define a sum function, the first is written in Haskell and the second is written in Python. The function in Haskell has **type annotations**, it means that we have declared which values can be computed in this function. Actually, we can omit the types and let Haskell infer them, but for learning purposes let's ignore this fact for a while. Applying the function to an `Int` and a `Char` will result in the following error:

```bash
Couldn't match expected type ‘Int’ with actual type ‘Char’
```

If we try to tell Haskell that one of the arguments will be a `Char`, by changing the type signature and then recompiling the code, it would reject the function because the `+` operator cannot support this behaviour. Since the error was caught at compile time, Haskell won't let us call the function in the interactive mode or generate the executable binary, if we had defined a `main` function.

```bash
[1 of 1] Compiling Main             ( test.hs, interpreted )

test.hs:2:15: error:
    • Couldn't match expected type ‘Int’ with actual type ‘Char’
    • In the second argument of ‘(+)’, namely ‘y’
      In the expression: x + y
      In an equation for ‘Main.sum’: Main.sum x y = x + y
  |
2 | sum x y = x + y
  |               ^
Failed, no modules loaded.
Prelude> 

```

The function in Python has no type annotations, and it will only know if the operation is valid when we actually try it. Trying to apply it on a number and a character, we'll get an similar error:

```bash
TypeError: cannot concatenate 'str' and 'int' objects
```

We can give two characters or two numbers, and Python's function will work just fine, concatenating the characters or adding the numbers. This flexibility can be very useful when we decide to change the software's specifications, requiring little or none changes in the code, and we can test the small changes right away. In Haskell, we would have to edit almost every affected function and, in bigger projects, compiling will take longer and increase the time to test small changes. At the other hand, since Haskell knows from the beginning how the values will be used, it can prevent an incorrect program from ever being executed (safety points) and increase performance by optimizing the function in the executable file. Even when there isn't much to optimize, Haskell doesn't have to check the validity of operations at runtime, while Python always need to check for it. These advantages and disadvantages come from the fact that Haskell is **statically typed** (confirm it [here](https://www.haskell.org/)) and Python is **dynamically typed** (confirm it [here](https://docs.python.org/3/faq/general.html#what-is-python)).

## Best of Both Worlds

Created by Jeremy Siek and Walid Taha with focus on functional languages, gradual typing relates to [Hannah Montana's song](https://www.youtube.com/watch?v=uVjRe8QXFHY) and combine the advantages of static and dynicamic typing. It is made by translating the dynamic parts of the code into type casts. Some may think that any way of combining static and dynamic typing is already gradual typing but this is not true. Gradual typing is a specific and programmer-controlled way to combine them. Take a look in this Haskell-like example:

```haskell
-- this is not a valid haskell code
concat :: String -> ? -> String
concat x y = x ++ y
```

Here, we would want the compiler to statically check and optimize what is possible and let only the unknown value types to be checked at run-time. So, it would have to sucessfully compile and then wait until execution to check if the operation is valid. You may think we can already do something like that in Haskell:

```haskell
concat :: Show a => String -> a -> String
concat x y = x ++ (show y)
```

But this is still static typing. Haskell will type-check this entirely at compile time and it has enough information to safely allow it. We're converting the second argument to `String` and we only allow values that can be converted to this type. Haskell won't compile this:

```haskell
-- this won't compile
concat :: String -> a -> String
concat x y = x ++ y
```

Since it cannot guarantee at compile time that the operation is valid, it won't let you proceed. A gradually typed language should be able to statically type-check all annotated types and wait until runtime to type-check the omitted ones. Gradually typed languages can balance safety, performance and flexibility, depending only on how many types we've declared. Programmers control, via code, how much static and dynamic checking will be done.

## Refined Criteria

As mentioned above, some think that gradual typing is any way of combining static and dynamic typing, and it has become an *umbrella term* with this meaning. Jeremy Siek, one of the term's creators, acknowledges his fault at informally characterizing what means to be gradually typed. For this reason, we now have some formal and objective criteria to classify a type systeam as gradual.

### Gradual typing is a superset of Static and Dynamic

In a gradually typed system, programmers can control how much static and dynamic type-checking will be done, by declaring or omitting the type annotations. It also means that programmers have the option to go extreme. If we annotate *all* types, the compiler should behave just like it would for a statically typed language, without losing any of the advantages mentioned; and if we omit all types, the compiler should behave just like it would for a dynamically typed language, skipping type-checking until runtime. Being able to walk in the mid-way can't forbid us to walk in the edges (what a mot!).

### Soundness

In logic, we say that a system is sound if every *provable* formula of the system is also true, in all interpretations regarding the system's semantics. We can think of it as some kind of safety, consistency or even validity. A gradually typed system is sound in the same way that many dynamically typed languages are sound: it will never encounter untrapped errors. Every error must be caught at compile time or at run-time type-checking. For example, if we write an invalid operation using omitted types, it is likely to cause a casting error at run-time and it has to be properly caught. Also, in a gradually typed language, the program's fully static regions that succesfully type-checked will never be the cause of run-time cast errors. This property is ensured by the Blame-Subtyping Theorem, an adaptation of the Blame Theorem, which the latter says: *"Well-typed programs can't be blamed"*. Quiet poetic.

### The Gradual Guarantee

This is the most charming criteria. In gradually typed systems, annotating or omitting type annotations shouldn't change the static or dynamic behavior. If we write a program with all type annotations and it is correct, removing type annotations can't change the program's behaviour. I mean, of course we are now skipping some type-checking for runtime but, there can be no way of a input-output relation being different just because we removed type annotations. Similarly, If we write a program omitting all types and the program is correct, properly annotating some or all types can't change the program's behaviour either. But the programmer can indeed insert a wrong type annotation that will lead to a static or cast error. So, inserting type annotations on a program can only lead to one of two possible outcomes:

1. The program's behaviour will not change.

2. There will be a caught error (either in compile or run time), caused by a mistaken type annotation.

Thanks to [Haskell's type inference](https://wiki.haskell.org/Type_inference), we can demonstrate how it'd work. But remember: this is an illustration on how the gradual guarantee works for programmers, **Haskell is not gradually typed**. If we write the following program in Haskell:

```haskell
x :: Int 
x = 2

y :: Int
y = 4

addDouble :: Int -> Int -> Int
addDouble n0 n1 = 2 * n0 + 2 * n1

main :: IO()
main = do
    print $ addDouble x y
```

It sucessfully compiles and evaluates to `12`. If we remove all type annotations, nothing changes:

```haskell
x = 2

y = 4

addDouble n0 n1 = 2 * n0 + 2 * n1

main = do
    print $ addDouble x y
```

 The program still compiles and evaluates to `12` (it will display some warnings, but that's okay). If we re-annotate the types we get to the previous program, and nothing changes again. But we can make a mistake and cause a error, that will be properly caught by the compiler. We cannot demonstrate the cast-error outcome, but I think using Haskell's type inference was a good way to show why the Gradual Guarantee is important in gradually typed languages, even though Haskell is not gradually typed (yeah, I'm reinforcing it just in case). 

## Example Languages

This is something hard to say. On [Wikipedia](https://en.wikipedia.org/wiki/Gradual_typing#Examples) we can find some *supposed* examples. The official pages of those languages don't claim they're gradually typed and the assertion for ActionScript comes from [this article](https://www.cs.umd.edu/~avik/papers/iogti.pdf) that go on another approach of gradual typing. Siek and Taha claimed at the original paper that Cecil, [Boo](https://boo-language.github.io/) and [Bigloo](https://www-sop.inria.fr/mimosa/fp/Bigloo/) support gradual typing "to a large degree". 

## This is just the start!

Although mixing static and dynamic typing is not really new, gradual typing is somehow recent, the original paper was published in 2006. There is stil much work being done, including research on how to efficiently implement gradual typing, based on modern and refined theories such as Space-efficient Calculus and Blame Calculus.

## Further Reading and References

Keep in mind that some Computer Science knowledge might be necessary to understand these papers. This [Benjamin Pierce's book](https://www.cis.upenn.edu/~bcpierce/tapl/) is amazing to study this subject. 

1. The original paper: [Gradual Typing for Functional Languages](http://schemeworkshop.org/2006/13-siek.pdf).

2. [Refined Criteria for Gradual Typing](http://homes.sice.indiana.edu/mvitouse/papers/snapl15.pdf). 

3. The Blame Theorem: [Well typed programs can't be blamed](https://link.springer.com/chapter/10.1007/978-3-642-00590-9_1).

4. Some problems and solutions based on [Blames and Coercions](https://dl.acm.org/doi/abs/10.1145/2737924.2737968).

5. A different foundation: [Abstracting Gradual Typing](https://dl.acm.org/doi/abs/10.1145/2914770.2837670).

---

This post was written by Maycon Amaro at February 14, 2020. At the publishing of this post, Maycon Amaro is a Computer Science undergraduate student at Federal University of Ouro Preto.


