---
layout: post
title: 'General Recursion in Agda — Part IV'
date: 2020-07-08 15:00:00 -0300
permalink: /blog/general-recursion-part-IV
author: Rodrigo Ribeiro
categories:
  - type theory
---

## Introduction

This is the fourth post in our series about techniques for defining recursive functions in Agda. 
The first three posts presented bounded and well-founded recursion and the Bove-Capretta method respectively.
In this post, we describe sized types, which allows to add a sort of "height" information to types that
can help Agda compiler to check totality of functions.

## Sized types

Before presenting the `merge` implementation using sized types, let's consider a more simple example to 
ilustrate the use of sized types to convince Agda's totality checker. A simple example of non-structurally
recursive functions is division for natural numbers in Peano notation. In Agda, such division algorithm 
can be easily expressed as:

```haskell
minus : N → N → N
minus 0 y = 0
minus x 0 = x
minus (suc x) (suc y) = minus x y

div : N → N → N
div 0       y = 0
div (suc x) y = suc (div (minus x y) y)
```

While this definition makes totally sense and is clearly total, Agda does not recognize `div` as such. 
Agda compiler cannot determine that the call `div (minus x y) y` is terminating. Since Agda's compiler uses
a syntatic criteria to determine if a function is terminating. However, due to undecidability of the halting
problem, there is no syntatic criteria that can precisely identify all terminating functions.

Techniques like bounded recursion or the Bove-Capretta method has the inconvenient which is adding an extra
parameter just to convince the termination checker. Well-founded recursion completely change the way 
one should define a function, since the programmer need to use a recursor, like `wfRec`, and the algorithmic 
logic should be implemented as a `step` function which restrict recursive calls to smaller arguments, according
to some well-founded ordering relation.

Sized types are a option which allow us to specify a type parameter which controls the height of terms and 
can be used by Agda's compiler to determine totality of functions. We can define the division using sized types
as follows. First, we need to change the definition of natural numbers in order to include a size parameter.

```haskell
data SNat : {i : Size} → Set where
  zero : {i : Size} → SNat {↑ i}
  succ : {i : Size} → SNat {i} → SNat {↑ i}
```
Type `Size` is a built-in Agda type available at module `Size` and enabled by the extension `sized-types`. Using 
`Size`, we can define type `SNat` which has a height bound specified by its size component. Both constructors of
type `SNat` use the operator `↑`, which represent the size successor operator. Thus, in `succ` constructor, we 
require a value of type `SNat {i}` and produce a value of type `SNat {↑ i}`, which denotes that the height bound
was increased by one. Using type `SNat`, the definition of the division algorithm is accepted by Agda's compiler 
without problems.

```haskell
minus : {ι : Size} → SNat {ι} → ℕ → SNat {ι}
minus zero      y        = zero
minus x         zero     = x
minus (succ x)  (suc y)  = minus x y

div : {i : Size} → SNat {i} → ℕ → ℕ
div (zero)    y  = zero 
div (succ x)  y  = suc (div (minus x y) y)
```

But what changed from the previous definition? The point is that Agda can infer by `minus` type that the its result
isn't bigger than its input. Then, when we call `minus x y` as argument to `div`, Agda can determine that the result
`minus x y` has smaller or equal height than the parameter `x` which is a subterm of `div`'s first argument. Using 
this reasoning, the Agda totality checker accepts the definition of `div`.

Next, we use sized types to provide an elegant implementation of the `merge` function.

## Sized Merge!

The first step in defining the `merge` function is to modify the list data type in order to include a size parameter
to denote its length bound.

```haskell
data SList : {i : Size} → Set where
  []  : {i : Size} → SList {↑ i}
  _∷_ : {i : Size} → A → SList {i} → SList {↑ i} 
```

Since the input lists may have different sizes, we need to quantify each one by a distinct size parameter, as presented 
by the type below.

```haskell
merge : ∀ {i i' : Size} → SList {i} → SList {i'} → SList
merge [] ys = ys
merge xs [] = xs
merge (x ∷ xs) (y ∷ ys) with x <? y
...| yes p = x ∷ merge xs (y ∷ ys)
...| no  p = y ∷ merge (x ∷ xs) ys
```

And, that's it! The definition is simply accepted by Agda! The length bound present in `SList` type is sufficient to 
please Agda's compiler to accept our implementation.

## Conclusion

In this post we briefly presented the sized types mechanism for defining general recursive functions. The use of 
sized types in Agda has an extensive literature in the context of co-induction. We suggest the interesed reader 
to consult the works of [Andreas Abel](http://www.cse.chalmers.se/~abela/), the main designer of Agda's sized types.
The code used in this post is available at the following 
[repository](https://github.com/lives-group/general-recursion).

In the last post of the series, I'll discuss the use a very elegant solution by Conor McBride using monads.
