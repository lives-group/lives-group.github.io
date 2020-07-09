---
layout: post
title: 'General Recursion in Agda --- Part II'
date: 2020-07-08 15:00:00 -0300
permalink: /blog/general-recursion-part-II
author: Rodrigo Ribeiro
categories:
  - type theory
---

## Introduction

In a previous post, we introduce the problem of defining functions with a non-trivial
recursive definition in Agda and presented the technique of bounded recursion. In this post,
we will study another technique, well-founded recursion.

The intutive idea of this technique is to ensure that a recursive call is allowed only
if it is made on arguments strictly smaller, according to some appropriate notion of "smaller".

## Notions of smaller

The mathematical notion of smaller is formalized by the concept of _ordering relations_.
A binary relation $$R$$ on a set $$A$$ is defined as a subset of the cartesian product 
$$A \times A$$, i.e. \(R \subseteq A \times A\). It is worth mention, that in books in 
mathematics uses the following way of representing the fact $$(x,y) \in R$$ as $xRy$. 
We will follow the same notation in this post.

Binary relations can have several properties of interest. We say that a relation is 
_irreflexive_ if the following holds $$\forall x. \neg xRx$$. A relation is 
anti-symmetric if $$\forall x y. xRy \land yRx \to x \neq y$$ and is transitive if
$$\forall x y z. xRy \land yRz \to xRz$$ holds. Finally, we say that a relation is 
a _strict ordering relation_ if it is irreflexive, anti-symmetric and transitive.

Given an ordering relation $$R \subseteq A \times A$$, we say that an element $$x\in A$$
is minimal if the following holds $$\neg\exists y. y R x$$. Intuitively, a element $$x$$ is 
minimal if it does not have an element which is smaller than it according to the relation 
$$R$$.

Our interest in ordering relations is because it can model mathematically the notion
of "smaller". Specially, we are interested in strict ordering relations because they 
cannot support trivial infinite decreasing chains. Given a relation $$<$$ on a set A,
we define a decreasing chain as: 

$$
x_1 < x_2 < x_3 < ... < x_{n - 1} < x_n
$$

We say that a chain is finite if there's exists $$n\in\mathbb{N}$$ such that 
the chain has $$n$$ elements. If there's no such $$n$$, we say that the chain 
is infinite. Descreasing chains are of special interests in formalizing termination
of algorithms because if the input arguments do not follow a finite 
decreasing chain, the function can loop forever by recursing over smaller arguments.
Ordering relations that do not have an infinite decreasing chain are said to be 
_well-formed_. In the next section, we describe how to encode well-formed relations
in Agda and use them to formalize recursive functions.

## Well-formed relations in Agda

After this brief recap on ordering relations, we now proceed to Agda enconding of 
these notions. First, we create a definition to represent relations as two argument
functions:

```haskell
Rel : Set → Set₁
Rel A = A → A → Set
```

Using this definition, we can encode the notion of a well-formed relation. However,
instead of using a negative concept --- the non existence of infinite decreasing chains ---
we will use a constructive route using an accesibility predicate. Using this notion, we 
can say that a set is well-formed if all of its elements are accessible. Elements are
accessible if:

1. Minimal elements are accessible.
2. An element $$x$$ is acessible if all elements smaller than $$x$$ are acessible.

We can represent the accessibility by the following type:

```haskell
data Acc {A : Set}(R : Rel A)(x : A) : Set where
  acc : (∀ y → R y x → Acc R y) → Acc R x
```

which states that a value $$x$$ is accessible if all values smaller than $$x$$ are accessible.
Using the `Acc` type, the definition of well-foundedness is immediate 

```haskell
WellFounded : {A : Set}(R : Rel A) → Set
WellFounded R = ∀ x → Acc R x
```

Since acessibility is an inductive type, we can define a _fold_ operator for it, as follows:

```haskell 
acc-fold : {A : Set}                         → 
           {R : Rel A}                       → 
           {P : A → Set}                     →
           (∀ x → (∀ y → R y x → P y) → P x) →
           ∀ z → Acc R z → P z
acc-fold IH z (acc H) = IH z (λ y y<z → acc-fold IH y (H y y<z))
```

which is the basis for the recursor for well-founded relations as: 

```haskell
wfRec : {A : Set}                         →
        (R : Rel A)                       →
        WellFounded R                     →
        ∀ (P : A → Set)                   →
        (∀ x → (∀ y → R y x → P y) → P x) →
        ∀ a → P a
wfRec R wf P IH a = acc-fold IH a (wf a)
```

But wait! What is the meaning of `wfRec` ? While its type seems scary, it is easy to 
understand. Let's pass through each of its parameters:

1. The first parameter has type `Rel A`, which is the ordering relation used in 
the recursor operator `wfRec`.

2. Second parameter states that the first parameter is a well-founded relation 
(type `WellFounded R`).

3. Third parameter is just the predicate which represents the property that 
we should prove by well-founded induction.

4. Fourth parameter is a step function which deserves our detailed attention. Let's look
at its type:

```haskell
∀ x → (∀ y → R y x → P y) → P x
```

The meaning of this type is that it encode the induction (recursion) hypothesis. Specifically,
it is a high-order function which allow us to conclude `P y` from a proof that `R y x`. Since
`R` is a well-founded relation, the proof of `R y x` denotes the fact that `y` is smaller than 
`x` according to relation `R`. The reader should note the similarity between this parameter and 
the formula for the principle of strong induction.

Defining functions and theorems by well-founded induction is essentially provide the 
necessary parameters to `wfRec`. In the next section, we will define some constructions that 
eases the task of building well-founded relations.

## Constructing well-founded relations

An interesting property of the class of well-founded relations is that it is closed 
under a large set of operations which allows us to build "bigger" relations from small ones.
The Agda standard library has a great number of constructions of well-founded relations. In
this post, I will provide details about the ones which will be needed to define our 
merge function.

The first construction on well-founded relations is the inverse image. Let's consider that we 
have a well-founded relation `R` on a set `B` and a function `f : A -> B`. Using `f` and `R`, 
we can define a well-founded relation on set `A` as follows: `x S y = (f x) R (f y)`. This 
informally described construction can be formalized by the following Agda module.

```haskell 
module InverseImageWellFounded 
    {A B}
    (f : A → B)(_<_ : Rel B) where

  _<<_ : Rel A
  x << y = f x < f y

  inv-img-acc : ∀ {x} → Acc _<_ (f x) → Acc _<<_ x
  inv-img-acc (acc g) 
    = acc (λ y fy<fx → inv-img-acc (g (f y) fy<fx))

  inv-img-WF : WellFounded _<_ → WellFounded _<<_
  inv-img-WF wf x = inv-img-acc (wf (f x))
```

Let's see each definition from this module. First, we have defined a new relation `_<<_ : Rel A` 
which uses the relation  `_<_ : Rel B` and function `f : A -> B`. Next, we show how to build 
acessibility proofs for `_<<_` from the ones for `_<_`.

The next construction we define is the lexicographic ordering, which extends to relations on 
pairs. Mathematically, we say that $$(x_1,y_1) < (x_2,y_2)$$ if $$x_1 < x_2$$ or 
$$x_1 = x_2 \lor y_1 < y_2$$, which is encoded by the following Agda type.

```haskell 
data _<_ : Rel (A × B) where
  left  : ∀ {x₁ y₁ x₂ y₂} (x₁<x₂ : RelA x₁ x₂) → (x₁ , y₁) < (x₂ , y₂)
  right : ∀ {x y₁ y₂}     (y₁<y₂ : RelB y₁ y₂) → (x  , y₁) < (x  , y₂)
```

The `left` constructor deals with the case when $$x_1 < x_2$$ and the `right` deals 
with the case when $$x_1 = x_2 \lor y_1 < y_2$$. Using this definition, we can build 
accesibility proofs using mutually recursive functions.

```haskell 
mutual
   accessibleA : ∀ {x y} → Acc RelA x →
                           WellFounded RelB →
                           Acc _<_ (x , y)
   accessibleA accA wfB 
      = acc (accessibleB accA (wfB _) wfB)


   accessibleB : ∀ {x y} → Acc RelA x →
                           Acc RelB y →
                           WellFounded RelB →
                           WfRec _<_ (Acc _<_) (x , y)
   accessibleB (acc rsA) _    wfB ._ (left  x′<x) 
      = accessibleA (rsA _ x′<x) wfB
   accessibleB accA (acc rsB) wfB ._ (right y′<y) 
      = acc (accessibleB accA (rsB _ y′<y) wfB)
```

Following the same pattern, we can build the proof of lexicographic orderings from 
proofs of well-founded relations for its components as follows:

```haskell
wellFounded : WellFounded RelA → 
              WellFounded RelB → 
              WellFounded _<_
wellFounded wfA wfB p = accessibleA (wfA (proj₁ p)) wfB
```

This are the constructions on well-formed relations needed to define the merge function.
In the next section, we present the definition of merge.

## Finally, merge!

Since we are trying to define merge by well-founded recursion, which ordering relation should
we use? The obvious choice is considering pairs of the length of merge's input lists. We will
define the ordering in two steps: first, we define a length-based ordering of lists; and 
second, we extend length ordering to pairs using the lexicographic ordering construction.

Length base ordering is defined by the following module.

```haskell
module LengthWF (A : Set) where
  open import Data.List
  open Nat-WF
  open InverseImageWellFounded (length {A = A}) _<'_ public

  length-wf : WellFounded _<<_
  length-wf = inv-img-WF <'-ℕ-wf
```

Module `LengthWF` uses the inverse image construction to build the length ordering using
`<'-ℕ-wf` ordering on natural numbers. The next definition extends length ordering to pairs
using the lexicographic construction.

```haskell
module MergeWF (A : Set) where
  open LengthWF A
  open import Data.List
  open import Data.Product

  open Lexicographic _<<_ _<<_

  merge-wf : WellFounded _<_
  merge-wf = wellFounded length-wf length-wf

  _<*_ : Rel (List A × List A)
  x <* y = x < y
```

Having defined the necessary ordering relation on pairs of lists, we can define the merge
function quite easily as presented in the next module.

```haskell
module Merge where
  open import Data.Product
  open import Data.Nat renaming (_<_ to _<N_)
  open import Data.List
  open MergeWF ℕ
  open Lexicographic


  -- first termination lemma

  termination-1 : ∀ (xs ys : List ℕ) x y → 
               (xs , y ∷ ys) <* (x ∷ xs , y ∷ ys)
  termination-1 xs ys x y = left Nat-WF.<'-base

  -- second termination lemma

  termination-2 : ∀ (xs ys : List ℕ) x y → 
               (x ∷ xs , ys) <* (x ∷ xs , y ∷ ys)
  termination-2 xs ys x y = right Nat-WF.<'-base

  -- merge function definition

    merge : List ℕ → List ℕ → List ℕ
    merge xs ys = wfRec _<*_ 
                        merge-wf 
                        (λ _ → List ℕ) 
                        step 
                        (xs , ys)
      where
        -- iteration step
        step : ∀ (x : List ℕ × List ℕ) →
               (∀ y → y <* x → List ℕ) →
               List ℕ
        step ([] , ys) IH = ys
        step (x ∷ xs , []) IH = x ∷ xs
        step (x ∷ xs , y ∷ ys) IH with x <? y
        ...| yes p = x ∷ IH (xs , y ∷ ys) (termination-1 xs ys x y)
        ...| no  q = y ∷ IH (x ∷ xs , ys) (termination-2 xs ys x y)
```

The functions `termination-1` and `termination-2` are proofs needed to 
make recursive calls in the merge function. Both states that we are 
decreasing the input size for merge.

Function `merge` definition is simply a call to function `wfRec` passing 
the needed ordering relation and its well-foundness proof, the return type, 
the step function and the input argument. The main logic of merging two lists 
is implemented by function `step`. The unique interesting case for `step` is
when both lists are non-empty. After testing if the first list head is smaller than
second's head, we build a list with head `x` and tail formed by the recursive call 
(recursive calls are made by executing the parameter IH, which acts as an inductive 
hypothesis). The same idea is used when `x` is greater or equal to `y`.

This concludes our implementation of our list merge function using well-founded induction.

## Conclusion

In this post, we described the technique of well-founded recursion by implementing it 
from the scratch in Agda. Most of the definitions presented in this post are available in 
the standard library. The code used in this post is available at the following 
[repository](https://github.com/lives-group/general-recursion).

In the next post, I will discuss another technique: the Bove-Capretta method.

