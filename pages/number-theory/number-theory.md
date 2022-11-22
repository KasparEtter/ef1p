---
title: Number theory
category: Mathematics
author: Kaspar Etter
license: CC BY 4.0
published: 2022-09-17
modified: 2022-11-22
teaser: A lot of modern cryptography builds on insights from number theory, which has been studied for centuries.
reddit: https://www.reddit.com/r/ef1p/comments/xgsco5/number_theory_explained_from_first_principles/
icon: percentage
math: true
---

<details markdown="block" open>
<summary markdown="span" id="preface">
Preface
</summary>

[Number theory](https://en.wikipedia.org/wiki/Number_theory)
is the study of [integers](https://en.wikipedia.org/wiki/Integer) and the relations between them.
[Carl Friedrich Gauss](https://en.wikipedia.org/wiki/Carl_Friedrich_Gauss) (1777 − 1855)
allegedly said that mathematics is the queen of the sciences and that number theory is the queen of mathematics.
What he meant by this is that mathematics,
unlike the [empirical sciences](https://en.wikipedia.org/wiki/Science#Branches_of_science),
studies regularities which are independent from the universe that we live in.
Not having to deal with the messiness of the real world
makes mathematics [the purest of all sciences](https://xkcd.com/435/).
Similarly, he must have considered number theory to be the most elegant
and [the purest branch of mathematics](https://en.wikipedia.org/wiki/Pure_mathematics),
given its [beauty](https://en.wikipedia.org/wiki/Mathematical_beauty)
and that it was studied for centuries for its own sake.
Or as [Leonard Eugene Dickson](https://en.wikipedia.org/wiki/Leonard_Eugene_Dickson)
(1874 − 1954) put it: "Thank God that number theory is unsullied by any application".
This changed with the advent of [modern cryptography](https://en.wikipedia.org/wiki/Cryptography#Modern_cryptography)
and [coding theory](https://en.wikipedia.org/wiki/Coding_theory) in the second half of the 20th century.
Unlike the mathematicians who discovered most of what I cover in this article,
we're studying number theory only for its applications in these two fields,
which will be the topics of the next two articles.

</details>

<details markdown="block" open>
<summary markdown="span" id="outline">
Outline
</summary>

The goal of this article is to understand
how we can construct [linear one-way functions](#linear-one-way-functions)
using [finite groups](#finite-groups) which have a [certain property](#discrete-logarithm-problem).
There are two families of finite groups which are widely used in modern cryptography:
[multiplicative groups](#multiplicative-groups) and [elliptic curves](#elliptic-curves).
The former are based on [modular arithmetic](#modular-arithmetic),
the latter on [finite fields](#finite-fields).
[Prime numbers](#prime-numbers) play a crucial role in both.
We'll study these topics in a somewhat peculiar order
and also visit [additive groups](#additive-groups) and [commutative rings](#commutative-rings) on our journey:

<figure markdown="block">
{% include_relative generated/outline.embedded.svg %}
<figcaption markdown="span">
How the various chapters of this article build on one another.
</figcaption>
</figure>

Since it's easy to get lost in theorems and proofs, I start this article with
introducing and motivating the concept of [linear one-way functions](#linear-one-way-functions)
so that we never lose sight of our goal.
Afterwards, I cover [finite groups](#finite-groups) in the abstract
in order to establish the terminology that we will use for the rest of the article.
Establishing such a mental framework first also helps us to process our observations later on.
Additionally, proving properties in the abstract saves us a lot of work when looking at multiple examples.
If you read about these topics for the first time,
feel free to jump ahead and play with [concrete examples](#additive-groups) before understanding the theory behind them.
If you really want to grasp the math behind modern cryptography,
you likely have to read this article more than once anyway.
The reason for covering [modular arithmetic](#modular-arithmetic) and [multiplicative groups](#multiplicative-groups)
before [prime numbers](#prime-numbers) is to get as far as possible before the math gets more challenging
and to understand why prime numbers are so special.
After learning about [elliptic curves](#elliptic-curves),
I cover the [best known algorithms](#dl-algorithms) for breaking our linear one-way functions in a bonus chapter,
before concluding the article with formal proofs of basic [group properties](#group-properties) as an appendix.

</details>

<details markdown="block" open>
<summary markdown="span" id="contributions">
Contributions
</summary>

There exist already plenty of textbooks and blog posts on number theory
(see below for [some recommendations](#further-reading)),
so I wasn't sure whether it's worth adding my own.
Since future articles will require a thorough understanding of number theory
and my ambition is to [explain things from first principles](/#ambition), I proceeded anyway.
Looking at the result, here's what sets this article apart:
- **Focus**: Number theory is a big field with many advanced concepts.
  This article focuses on the aspects which are relevant for modern cryptography and coding theory.
  As you'll see, almost all theorems mentioned in this article are being used later on.
- **Notation**: As we'll see, [two notations](#notation) are used in [group theory](#finite-groups),
  and I haven't found any other source which consistently provides both.
  Not having to translate between the two yourself
  reduces your [cognitive load](https://en.wikipedia.org/wiki/Cognitive_load).
- **Intuition**: I went to great lengths to complement formal proofs with more intuitive explanations.
  While formal rigor is important, nothing beats an intuitive understanding of a theorem or an algorithm.
- **Completeness**: Apart from the chapter on [elliptic curves](#elliptic-curves),
  I took no shortcuts when explaining why things are the way they are.
  Therefore, this article contains the complete proofs of almost all covered theorems,
  including [Carmichael's totient function](#carmichaels-totient-function),
  the [Monier-Rabin bound](#monier-rabin-bound-on-the-number-of-liars),
  [square roots modulo composite numbers](#square-roots-modulo-composite-numbers),
  and the [expected running time of Pollard's rho algorithm](#birthday-paradox),
  which I haven't found online outside of PDFs.
  While you might not be interested in such advanced proofs for now,
  this article is designed to serve as a work of reference for your whole journey into modern cryptography.
- **Interactivity**: Depending on how you count them,
  this article contains up to 40 [interactive tools](/#interactive-tools),
  which I also published on a [separate page](/number-theory/tools/).
  Many tools, such as the [repetition tables](#multiplicative-group-repetition-table),
  visualize important group properties.
  Many other tools show how important algorithms work,
  such as the [extended Euclidean algorithm](#extended-euclidean-algorithm),
  the [Miller-Rabin primality test](#miller-rabin-primality-test),
  and the [Tonelli-Shanks algorithm](#tonelli-shanks-algorithm).
  I also implemented the [main algorithms](#dl-algorithms)
  to solve the [discrete-logarithm problem](#discrete-logarithm-problem),
  such as [Pollard's rho algorithm](#pollards-rho-algorithm),
  the [Pohlig-Hellman algorithm](#pohlig-hellman-algorithm),
  and the [index-calculus algorithm](#index-calculus-algorithm).
  Besides being fun to play with, these tools allow you to check your own hypotheses,
  which makes mathematics an empirical science after all. 🙂

</details>

<details markdown="block">
<summary markdown="span" id="math-aversion">
Math aversion
</summary>

It should be no surprise that an article about math contains a lot of math.
If you're afraid of math, then see this article as a free
[exposure-therapy](https://en.wikipedia.org/wiki/Exposure_therapy) session.
On a more serious note: Number theory is quite different from the math you endured during high school.
Number theory is mostly about understanding why some properties follow from others.
You won't have to calculate anything yourself; this is what computers are for.
At times, the notation can seem daunting,
but this is actually a problem of language and communication, not math.
The situation isn't made easier by the fact that [different notations](#notation)
are used to talk about the same things.
While I tried to keep everything as unconfusing as possible, this is an aspect that I couldn't change.

</details>

<details markdown="block">
<summary markdown="span" id="why-proofs">
Why proofs?
</summary>

There is a big difference between understanding how something works and understanding why something works.
In mathematics, answers to why questions are called [proofs](https://en.wikipedia.org/wiki/Mathematical_proof).
Proofs explain why a statement is true by showing how the statement can be deduced
from already proven statements (called [theorems](https://en.wikipedia.org/wiki/Theorem))
and statements which are simply assumed to be true (called [axioms](https://en.wikipedia.org/wiki/Axiom)).
If you want to understand only how modern cryptography works,
you can skip this whole article and read just the next one.
If you want to understand also why modern cryptography works,
there is no way around proofs, even if you find them overly formal and tedious.
But of course, you can always ignore answers to questions you would not have asked.

</details>

<details markdown="block">
<summary markdown="span" id="further-reading">
Further reading
</summary>

The two most important sources when writing this article were
[A Computational Introduction to Number Theory and Algebra](https://shoup.net/ntb/)
by [Victor Shoup](https://shoup.net/)
and the [Handbook of Applied Cryptography](https://cacr.uwaterloo.ca/hac/)
by [Alfred Menezes](https://uwaterloo.ca/scholar/ajmeneze),
[Paul van Oorschot](https://carleton.ca/scs/people/paul-van-oorschot/),
and [Scott Vanstone](https://uwaterloo.ca/combinatorics-and-optimization/about/people/scott-vanstone) (1947 − 2014).
Consult the former for mathematical proofs and the latter for algorithmic aspects.
Other useful sources are [wikis](https://en.wikipedia.org/wiki/Wiki) for proofs,
such as [ProofWiki](https://proofwiki.org/wiki/Main_Page)
and [Groupprops](https://groupprops.subwiki.org/wiki/Main_Page),
and [question-and-answer websites](https://en.wikipedia.org/wiki/Q%26A_software),
such as [Stack Exchange](https://math.stackexchange.com/) and [Quora](https://quora.com).

</details>


## Linear one-way functions


### Definition

The term "linear one-way function" consists of three words:
- [**Function**](https://en.wikipedia.org/wiki/Function_(mathematics)):
  A function maps inputs from one [set](https://en.wikipedia.org/wiki/Set_(mathematics))
  to outputs in the same or some other set.
  In mathematics, functions are always [deterministic](https://en.wikipedia.org/wiki/Deterministic_algorithm),
  which means that the output is determined entirely by the input.
  I write $$f(a) = A$$, with $$f$$ being the name of the function,
  lowercase $$a$$ denoting the input, and uppercase $$A$$ referring to the output of the function.
- [**One-way**](https://en.wikipedia.org/wiki/One-way_function):
  Computing the output $$A$$ from the input $$a$$ is efficient,
  whereas finding an input $$a$$ which maps to a given output $$A$$ is
  [computationally infeasible](#computational-complexity-theory).
  I depict efficient calculations with a green arrow and infeasible ones with a red arrow.
- [**Linear**](https://en.wikipedia.org/wiki/Linear_function):
  We restrict the input of our function to [integers](https://en.wikipedia.org/wiki/Integer) (the whole numbers)
  and require that there exists some [operation](https://en.wikipedia.org/wiki/Operation_(mathematics)) $$\circ$$
  so that $$f(a + b) = f(a) \circ f(b)$$.
  (The [ring operator](https://unicode-table.com/en/2218/) `∘` is often used to denote
  the [composition of functions](https://en.wikipedia.org/wiki/Function_composition),
  but I use it simply as a placeholder for an [actual operator](#notation).)
  In other words, if $$a + b = c$$, then $$f(a) \circ f(b) = f(c)$$, which can be illustrated as follows:

<figure markdown="block">
{% include_relative generated/linear-one-way-function.embedded.svg %}
<figcaption markdown="span">
The properties of a linear one-way function.
</figcaption>
</figure>

Since

$$
f(1 + 1) = f(1) \circ f(1)
$$

and thus

$$
f(n) = f(\underbrace{1 + … + 1 \mathstrut}_{n \text{ times}})
= \underbrace{f(1) \circ … \circ f(1)}_{n \text{ times}}\text{,}
$$

the inputs can be called [scalars](https://en.wikipedia.org/wiki/Scalar_(mathematics))
because they scale the output of the function by a linear factor.

<details markdown="block">
<summary markdown="span" id="comparison-with-cryptographic-hash-functions">
Comparison with cryptographic hash functions
</summary>

As we saw in a [previous article](/email/#cryptographic-hash-functions),
[cryptographic hash functions](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
work on inputs of arbitrary size and have to fulfill additional requirements,
namely second-preimage resistance and collision resistance.
We don't care about these properties here
because we will limit our linear one-way functions to a finite set of inputs
and construct them in such a way that unequal inputs are mapped to unequal outputs.
Depending on whether you limit the set of inputs or not,
second preimages either don't exist or are trivial to find.
On the other hand, cryptographic hash functions are typically not linear
(as long as we ignore [provably secure hash functions](https://en.wikipedia.org/wiki/Security_of_cryptographic_hash_functions#Provably_secure_hash_functions),
which are of limited practical use).

</details>

<details markdown="block">
<summary markdown="span" id="computational-complexity-theory">
Computational complexity theory
</summary>

[Computational complexity theory](https://en.wikipedia.org/wiki/Computational_complexity_theory)
classifies problems according to how many steps are needed to solve them.
Determining the precise number of steps required to solve an instance of a problem is of little interest, though.
What computer scientists care about is how the required effort depends on the size of the input:
If you double the input, does the number of steps that it takes to find a solution grow
[polynomially](https://en.wikipedia.org/wiki/Time_complexity#Polynomial_time), such as quadrupling,
or [exponentially](https://en.wikipedia.org/wiki/Time_complexity#Exponential_time)?
Problems whose computational complexity grows exponentially with the input size become
[intractable](https://en.wikipedia.org/wiki/Computational_complexity_theory#Intractability)
if you make the input large enough.
One-way functions can exist only if there are problems
which cannot be solved in [polynomial time](https://en.wikipedia.org/wiki/Time_complexity#Polynomial_time),
but solutions to which can be verified in polynomial time.
It is widely believed that such problems exist, but we still lack a proof for this.
This [conjecture](https://en.wikipedia.org/wiki/Conjecture),
which is known as [P ≠ NP](https://en.wikipedia.org/wiki/P_versus_NP_problem), is the most important
[open question in computer science](https://en.wikipedia.org/wiki/List_of_unsolved_problems_in_computer_science).
Examples of problems for which no polynomial-time algorithms are known
but whose solution can be verified in polynomial time are [integer factorization](#prime-factorization)
and the [discrete-logarithm problem (DLP)](#discrete-logarithm-problem).

</details>


### Motivation

Linear one-way functions are useful in cryptography
because they allow a party to conceal information by feeding it into a linear one-way function,
while another party can still perform computations with the output of the linear one-way function.
For example, a party who knows the output $$f(a)$$ and the input $$b$$ can calculate $$f(a \cdot b)$$
without having to learn $$a$$ by repeating $$f(a)$$ $$b$$ times:

$$
f(a \cdot b) = f(\underbrace{a + … + a \mathstrut}_{b \text{ times}})
= \underbrace{f(a) \circ … \circ f(a)}_{b \text{ times}}\text{.}
$$


### Notation

Linear one-way functions are an abstract concept, which I made up for this introduction to
[asymmetric cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography).
Instead of using the generic operator $$\circ$$,
the operation in the output set of actual linear one-way functions is usually written
as [addition](https://en.wikipedia.org/wiki/Addition)
or [multiplication](https://en.wikipedia.org/wiki/Multiplication),
even when it has [nothing to do](#point-addition) with addition or multiplication of integers.
As a consequence, every equation can be written in a generic, an additive,
and a multiplicative [notation](https://en.wikipedia.org/wiki/Abelian_group#Notation).
I do this with boxes like the following,
where I choose the default notation (or "all") depending on the context,
and you can select another notation by clicking on the corresponding tab:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="All">

$$
f(a + b) = f(a) \circ f(b)
$$

$$
f(a + b) = f(a) + f(b)
$$

$$
f(a + b) = f(a) \cdot f(b)
$$

</div>

You can change the notation throughout this article by double-clicking on the corresponding tab.


### Repetitions

As we will see, linear one-way functions are typically constructed
by [repeating an element](#element-repetitions) from the output set,
the so-called [generator](#group-generators) $$G$$, the specified number of times.
Repeated addition is written as multiplication,
where the [multiplication sign](https://en.wikipedia.org/wiki/Multiplication_sign) is usually
[omitted](https://en.wikipedia.org/wiki/Juxtaposition#Mathematics),
and repeated multiplication is written as [exponentiation](https://en.wikipedia.org/wiki/Exponentiation):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="All">

$$
f(a) = \underbrace{G \circ … \circ G}_{a \text{ times}}
$$

$$
f(a) = aG
$$

$$
f(a) = G^a
$$

</div>

The generic notation is a valuable reminder that the additive and the multiplicative notation stand for the same thing.
However, repetitions are a bit cumbersome to write,
which is why only the additive and the multiplicative notation are used in practice.


### Linearity

It is easy to see why repeating an element from the output set is a linear operation
(assuming that the operation is [associative](#group-axioms)):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
f(a + b)
= \underbrace{G \circ … \circ G}_{a + b \text{ times}}
= \underbrace{G \circ … \circ G}_{a \text{ times}} \circ \underbrace{G \circ … \circ G}_{b \text{ times}}
= f(a) \circ f(b)
$$

$$
f(a + b) = (a + b)G = aG + bG = f(a) + f(b)
$$

$$
f(a + b) = G^{a + b} = G^a \cdot G^b = f(a) \cdot f(b)
$$

</div>


### Zero as input

If [zero](https://en.wikipedia.org/wiki/0) is a valid input to a linear function,
there has to be an element in the output set which does not affect any other element:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
f(a) = f(a + 0) = f(a) \circ f(0)
$$

$$
f(a) = f(a + 0) = f(a) + f(0)
$$

$$
f(a) = f(a + 0) = f(a) \cdot f(0)
$$

</div>

This element is called the [identity element](https://en.wikipedia.org/wiki/Identity_element) or the neutral element.
Given its special role, we assign a specific letter to it:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="All">

$$
f(0) = \underbrace{G \circ … \circ G}_{0 \text{ times}} = E
$$

$$
f(0) = 0G = O
$$

$$
f(0) = G^0 = I
$$

</div>

Note that I use the letters $$O$$ and $$I$$ instead of $$0$$ and $$1$$
because elements in the output set do not have to be integers.
In the case of [elliptic curves](#elliptic-curves),
for example, $$O$$ is the [point at infinity](#point-at-infinity).
The resemblance with the corresponding integer is no coincidence, though.


### Negative inputs

If we allow the input of a linear function to be [negative](https://en.wikipedia.org/wiki/Negative_number),
there has to be an [inverse element](https://en.wikipedia.org/wiki/Inverse_element) for each element in the output set:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
f(0) = f(a + (-a)) = f(a) \circ f(-a) = E
$$

$$
f(0) = f(a + (-a)) = f(a) + f(-a) = O
$$

$$
f(0) = f(a + (-a)) = f(a) \cdot f(-a) = I
$$

</div>

In the following chapter, we will formalize these concepts and prove interesting properties about them.

<details markdown="block" open>
<summary markdown="span" id="abstract-algebra">
Abstract algebra
</summary>

[Algebra](https://en.wikipedia.org/wiki/Algebra) is the study of how to manipulate equations with symbols,
and [abstract algebra](https://en.wikipedia.org/wiki/Abstract_algebra) is the study of
[algebraic structures](https://en.wikipedia.org/wiki/Algebraic_structure),
which consist of a set and certain operations on the elements of the set.
The goal of abstract algebra is to understand the properties of such structures
at the highest level of [abstraction](https://en.wikipedia.org/wiki/Abstraction)
so that these properties are applicable to any structure
which satisfies the same requirements.
Each algebraic structure has its own set of requirements,
which are called [axioms](https://en.wikipedia.org/wiki/Axiom).
Axioms are the [premises](https://en.wikipedia.org/wiki/Premise)
from which [conclusions](https://en.wikipedia.org/wiki/Logical_consequence) are derived.
The next chapter is about [finite groups](#finite-groups),
but we'll encounter other algebraic structures later on,
namely [commutative rings](#commutative-rings) and [finite fields](#finite-fields).

</details>


## Finite groups


### Group axioms

A [group](https://en.wikipedia.org/wiki/Group_(mathematics))
consists of a [set](https://en.wikipedia.org/wiki/Set_(mathematics))
and a [binary operation](https://en.wikipedia.org/wiki/Binary_operation),
which combines any two elements of the set according to the
[following rules](https://en.wikipedia.org/wiki/Group_(mathematics)#Definition):

- [**Closure**](https://en.wikipedia.org/wiki/Closure_(mathematics)):
  When applying the operation to any two elements of the set, the resulting element is also part of the set.
- [**Associativity**](https://en.wikipedia.org/wiki/Associative_property):
  Operations can be evaluated in any order without changing the result (i.e. parentheses don't matter).
- [**Identity**](https://en.wikipedia.org/wiki/Identity_element):
  There exists a unique identity element which, when combined with any element, results in the other element.
- [**Invertibility**](https://en.wikipedia.org/wiki/Inverse_element):
  Each element has a unique inverse. If you combine an element with its inverse, you get the identity element.

The operation can be written in [different ways](#notation),
which leads to different notations for the identity element and the inverses:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="All" markdown="block">

- **Associativity**: For any elements $$A$$, $$B$$, and $$C$$, $$(A \circ B) \circ C = A \circ (B \circ C)$$.
- **Identity element $$E$$**: For any element $$A$$, $$A \circ E = E \circ A = A$$.
- **$$\overline{A}$$ for the inverse of $$A$$**: For any element $$A$$, $$A \circ \overline{A} = \overline{A} \circ A = E$$.

<!-- -->

- **Associativity**: For any elements $$A$$, $$B$$, and $$C$$, $$(A + B) + C = A + (B + C)$$.
- **Identity element $$O$$**: For any element $$A$$, $$A + O = O + A = A$$.
- **$$-A$$ for the inverse of $$A$$**: For any element $$A$$, $$A + (-A) = (-A) + A = O$$.

<!-- -->

- **Associativity**: For any elements $$A$$, $$B$$, and $$C$$, $$(A \cdot B) \cdot C = A \cdot (B \cdot C)$$.
- **Identity element $$I$$**: For any element $$A$$, $$A \cdot I = I \cdot A = A$$.
- **$$A^{-1}$$ for the inverse of $$A$$**: For any element $$A$$, $$A \cdot A^{-1} = A^{-1} \cdot A = I$$.

</div>

Usually, the group axioms are presented in a [reduced version](#reduced-group-axioms),
from which properties like the [uniqueness of the identity](#uniqueness-of-right-identity) are derived.
Since this is not important for our purposes,
I moved [such derivations](#derived-group-properties) to the [end of this article](#group-properties).

<details markdown="block" open>
<summary markdown="span" id="example-of-a-finite-group">
Example of a finite group
</summary>

The hours of an [analog clock](https://en.wikipedia.org/wiki/Clock#Analog) form a finite group.
Its set consists of the elements 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, and 12.
In order to make things easier mathematically, we relabel 12 as 0.
The operation is addition, where we wrap around to 0 after reaching 11:

<figure markdown="block">
{% include_relative generated/modulo-clock.embedded.svg %}
<figcaption markdown="span">
6 hours past 9 a.m. is 3 p.m.
</figcaption>
</figure>

As we'll discuss later, the wrapping around corresponds to the [modulo operation](#modulo-operation).
Clearly, this group is closed: No matter how much time passes,
the [hour hand](https://en.wikipedia.org/wiki/Clock_face) never leaves the clock.
Associativity is given by the linearity of time and addition:
Waiting for B hours and then for C hours is the same as waiting for B + C hours.
0 is the identity element: A + 0 = 0 + A = A.
And finally, every element has an inverse:
the number of hours you have to wait until it's noon or midnight again.
For example, 2 + 10 = 0.

</details>


### Unique solution

The defining property of a group is that the following equation has a unique solution
for any elements $$A$$ and $$B$$ of the group:

<div class="tabbed aligned" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
X \circ A = B \textsf{ has a unique solution, namely } X = B \circ \overline{A} \\[2pt]
\textsf{because }(B \circ \overline{A}) \circ A = B \circ (\overline{A} \circ A) = B \circ E = B \textsf{.} \\[8pt]
\textsf{Any two solutions } X_1 \textsf{ and } X_2 \textsf{ are the same because} \\[3pt]
\begin{aligned}
X_1 \circ A &= X_2 \circ A \\
(X_1 \circ A) \circ \overline{A} &= (X_2 \circ A) \circ \overline{A} \\
X_1 \circ (A \circ \overline{A}) &= X_2 \circ (A \circ \overline{A}) \\
X_1 \circ E &= X_2 \circ E \\
X_1 &= X_2 \textsf{.}
\end{aligned}
$$

$$
X + A = B \textsf{ has a unique solution, namely } X = B + (-A) \\[2pt]
\textsf{because }(B + (-A)) + A = B + ((-A) + A) = B + O = B \textsf{.} \\[8pt]
\textsf{Any two solutions } X_1 \textsf{ and } X_2 \textsf{ are the same because} \\[3pt]
\begin{aligned}
X_1 + A &= X_2 + A \\
(X_1 + A) + (-A) &= (X_2 + A) + (-A) \\
X_1 + (A + (-A)) &= X_2 + (A + (-A)) \\
X_1 + O &= X_2 + O \\
X_1 &= X_2 \textsf{.}
\end{aligned}
$$

$$
X \cdot A = B \textsf{ has a unique solution, namely } X = B \cdot A^{-1} \\[2pt]
\textsf{because }(B \cdot A^{-1}) \cdot A = B \cdot (A^{-1} \cdot A) = B \cdot I = B \textsf{.} \\[8pt]
\textsf{Any two solutions } X_1 \textsf{ and } X_2 \textsf{ are the same because} \\[3pt]
\begin{aligned}
X_1 \cdot A &= X_2 \cdot A \\
(X_1 \cdot A) \cdot A^{-1} &= (X_2 \cdot A) \cdot A^{-1} \\
X_1 \cdot (A \cdot A^{-1}) &= X_2 \cdot (A \cdot A^{-1}) \\
X_1 \cdot I &= X_2 \cdot I \\
X_1 &= X_2 \textsf{.}
\end{aligned}
$$

</div>

{:#unique-result}
The same is true if $$X$$ is on the right side of $$A$$.
Since the solution is unique, different combinations map to different results:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\textsf{If } X_1 ≠ X_2 \textsf{, then } X_1 \circ A ≠ X_2 \circ A \textsf{.}
$$

$$
\textsf{If } X_1 ≠ X_2 \textsf{, then } X_1 + A ≠ X_2 + A \textsf{.}
$$

$$
\textsf{If } X_1 ≠ X_2 \textsf{, then } X_1 \cdot A ≠ X_2 \cdot A \textsf{.}
$$

</div>


### Commutative groups

An operation is [commutative](https://en.wikipedia.org/wiki/Commutative_property)
if swapping the inputs does not change the output,
i.e. the following holds for any elements $$A$$ and $$B$$:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
A \circ B = B \circ A
$$

$$
A + B = B + A
$$

$$
A \cdot B = B \cdot A
$$

</div>

Commutativity is not required in the [above definition](#group-axioms).
It follows from the [reduced group axioms](#reduced-group-axioms)
that the right identity is also an identity [when applied from the left](#right-identity-is-left-identity)
and that any right inverse is also an inverse [when applied from the left](#right-inverses-are-left-inverses),
even if the operation itself is not commutative.
A group whose operation is commutative is called a commutative group
or an [abelian group](https://en.wikipedia.org/wiki/Abelian_group),
named after [Niels Henrik Abel](https://en.wikipedia.org/wiki/Niels_Henrik_Abel) (1802 − 1829).
(Even though "abelian" is derived from a [proper name](https://en.wikipedia.org/wiki/Proper_name),
the first letter is [usually not capitalized](https://en.wikipedia.org/wiki/Abelian_group#A_note_on_typography).)


### Element repetitions

Instead of combining two different elements, a single element can be combined repeatedly with itself.
We write this as follows:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Both">

$$
nA = \underbrace{A + … + A}_{n \text{ times}}
$$

$$
A^n = \underbrace{A \cdot … \cdot A}_{n \text{ times}}
$$

</div>

As [noted earlier](#notation), the generic operation $$\circ$$ lacks a concise notation for repetitions,
which is why I don't include it in this section.

{:#added-repetitions}
Since the group operation is associative (which means that we can move parentheses around),
it follows immediately that:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Both">

$$
(m + n)A = \underbrace{A + … + A}_{m + n \text{ times}}
= (\underbrace{A + … + A}_{m \text{ times}}) + (\underbrace{A + … + A}_{n \text{ times}})
= mA + nA
$$

$$
A^{m + n} = \underbrace{A \cdot … \cdot A}_{m + n \text{ times}}
= (\underbrace{A \cdot … \cdot A}_{m \text{ times}}) \cdot (\underbrace{A \cdot … \cdot A}_{n \text{ times}})
= A^m \cdot A^n
$$

</div>

{:#cancelled-repetitions}
And since repetitions of inverses cancel as many repetitions of the element itself,
we can make it work for differences as well:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Both">

$$
(m - n)A = \underbrace{A + … + A}_{m - n \text{ times}}
= (\underbrace{A + … + A}_{m \text{ times}}) + (\underbrace{(-A) + … + (-A)}_{n \text{ times}})
= mA + n(-A)
$$

$$
A^{m - n} = \underbrace{A \cdot … \cdot A}_{m - n \text{ times}}
= (\underbrace{A \cdot … \cdot A}_{m \text{ times}}) \cdot (\underbrace{A^{-1} \cdot … \cdot A^{-1}}_{n \text{ times}})
= A^m \cdot (A^{-1})^n
$$

</div>

{:#zero-and-negative-repetitions}
If we don't require the difference to be positive,
we get the following definitions for zero and a negative number of repetitions:

<div class="tabbed aligned" data-titles="Additive | Multiplicative | Both" data-default="Both">

$$
\begin{aligned}
0A &= O \\
(-n)A &= n(-A)
\end{aligned}
$$

$$
\begin{aligned}
A^0 &= I \\
A^{-n} &= (A^{-1})^n
\end{aligned}
$$

</div>

<details markdown="block">
<summary markdown="span" id="element-repetitions-example">
Element repetitions example
</summary>

In the case of an [analog clock](#example-of-a-finite-group), we wrap around to $$0$$ when reaching $$12$$.
[I write](#equivalence-relation) $$A =_{12} B$$ to denote that $$A = B$$ up to a multiple of $$12$$.
Repeating the element $$5$$, we have $$2 \cdot 5 =_{12} 5 + 5 =_{12} 10$$,
followed by $$3 \cdot 5 =_{12} 5 + 5 + 5 =_{12} 10 + 5 =_{12} 3$$, and so on:

<figure markdown="block">

| 1 · 5 | 2 · 5 | 3 · 5 | 4 · 5 | 5 · 5 | 6 · 5 | 7 · 5 | 8 · 5 | 9 · 5 | 10 · 5 | 11 · 5 | 12 · 5 | …
|-
| 5 | 10 | 3 | 8 | 1 | 6 | 11 | 4 | 9 | 2 | 7 | 0 | …
{:.table-with-borders .text-nowrap .text-center}

<figcaption markdown="span">

Repeating the element 5 in the so-called [additive group](#additive-groups) of integers [modulo](#modulo-operation) 12.

</figcaption>
</figure>

Using the [above definitions](#zero-and-negative-repetitions),
we have that $$0 \cdot 5 =_{12} 0$$ and $$(-n)5 =_{12} n(-5)$$,
where $$-5 =_{12} 7$$ because $$5 + 7 =_{12} 0$$.
Therefore: 

<figure markdown="block">

| (−1) · 5<br>= 1 · 7 | (−2) · 5<br>= 2 · 7 | (−3) · 5<br>= 3 · 7 | (−4) · 5<br>= 4 · 7 | (−5) · 5<br>= 5 · 7 | (−6) · 5<br>= 6 · 7 | (−7) · 5<br>= 7 · 7 | (−8) · 5<br>= 8 · 7 | (−9) · 5<br>= 9 · 7 | (−10) · 5<br>= 10 · 7 | (−11) · 5<br>= 11 · 7 | (−12) · 5<br>= 12 · 7 | …
|-
| 7 | 2 | 9 | 4 | 11 | 6 | 1 | 8 | 3 | 10 | 5 | 0 | …
{:.table-with-borders .text-nowrap .text-center}

<figcaption markdown="span">

The negative repetitions of the element 5 in the additive group of integers modulo 12.

</figcaption>
</figure>

</details>


### Fast repetitions

The goal of this article is to construct [linear one-way functions](#linear-one-way-functions).
As we've seen in the introduction, [repeating an element](#element-repetitions) is a [linear operation](#linearity).
As we'll see [later](#discrete-logarithm-problem), figuring out how many times an element has been repeated
is [(presumably) computationally infeasible](#computational-complexity-theory) in some groups.
In this section, we want to understand why repeating an element a certain number of times is so much easier
than determining the number of repetitions when given the result.
Let's start with how we can compute element repetitions efficiently.

Instead of performing one repetition at a time,
we can compute $$A$$ repeated $$n$$ times for any integer $$n$$ using the following insight:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
nA = \begin{cases}
(-n)(-A) &\text{if } n < 0 \text{,} \\
O &\text{if } n = 0 \text{,} \\
(n - 1)A + A &\text{if } n \text{ is odd,} \\
2(\frac{n}{2}A) &\text{if } n \text{ is even.}
\end{cases}
$$

$$
A^n = \begin{cases}
(A^{-1})^{-n} &\text{if } n < 0 \text{,} \\
I &\text{if } n = 0 \text{,} \\
A^{n-1} \cdot A &\text{if } n \text{ is odd,} \\
(A^{\frac{n}{2}})^2 &\text{if } n \text{ is even.}
\end{cases}
$$

</div>

Solving a problem by reducing it to smaller instances of the same problem is known
as [recursion](https://en.wikipedia.org/wiki/Recursion_(computer_science)).
The above [algorithm](https://en.wikipedia.org/wiki/Algorithm) terminates
because a negative $$n$$ is transformed into a positive $$n$$
and then $$n$$ gets smaller in every iteration until it reaches zero.
Since an odd number becomes even when you subtract one, $$n$$ is halved at least in every other iteration.
Therefore, the [running time](https://en.wikipedia.org/wiki/Analysis_of_algorithms#Run-time_analysis)
of the algorithm is [logarithmic](https://en.wikipedia.org/wiki/Time_complexity#Logarithmic_time)
with regard to the input $$n$$.
Since halving a [binary number](/internet/#number-encoding) is the same as dropping its
[least-significant bit](https://en.wikipedia.org/wiki/Bit_numbering#Bit_significance_and_indexing),
one can also say that the running time is linear in the [bit length](https://en.wikipedia.org/wiki/Bit-length) of $$n$$.
In other words, if you double the length of a number (rather than its size),
you just double the number of steps required.

When using the [multiplicative notation](#notation), this algorithm is known as
[exponentiation by squaring](https://en.wikipedia.org/wiki/Exponentiation_by_squaring) or square-and-multiply.
When using the [additive notation](#notation), this becomes multiplication by doubling or double-and-add.
The algorithm exploits the fact that the group operation is [associative](#group-axioms):
Instead of evaluating the expression from left to right,
the operations are grouped in such a way that as many intermediate results as possible can be reused.
Reusing intermediate results instead of recomputing them is called
[common subexpression elimination](https://en.wikipedia.org/wiki/Common_subexpression_elimination)
in [compiler design](https://en.wikipedia.org/wiki/Compiler).
It's also the core idea of [dynamic programming](https://en.wikipedia.org/wiki/Dynamic_programming).
Let's look at [an example](https://en.wikipedia.org/wiki/Exponentiation_by_squaring#Basic_method):

<div class="tabbed aligned" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

<div markdown="block">

$$
\begin{aligned}
13A &= A + A + A + A + A + A + A + A + A + A + A + A + A \\
&= \bigg(\Big(\big((A + A) + A\big) + \big((A + A) + A\big)\Big)
+ \Big(\big((A + A) + A\big) + \big((A + A) + A\big)\Big)\bigg) + A \\
&= 2\Big(2\big(2(O + \underset{1}{\underset{\uparrow}{A}}) + \underset{1}{\underset{\uparrow}{A}}\big)
+ \underset{0}{\underset{\uparrow}{O}}\Big) + \underset{1}{\underset{\uparrow}{A}}
\end{aligned}
$$

<figure markdown="block">
{% include_relative generated/fast-repetitions-additive.embedded.svg %}
<figcaption markdown="span">
We can compute 13A in 5 steps (in green) instead of 12 steps (in blue) by doubling intermediate results.
</figcaption>
</figure>

</div>

<div markdown="block">

$$
\begin{aligned}
A^{13} &= A \cdot A \cdot A \cdot A \cdot A \cdot A \cdot A \cdot A \cdot A \cdot A \cdot A \cdot A \cdot A \\
&= \bigg(\Big(\big((A \cdot A) \cdot A\big) \cdot \big((A \cdot A) \cdot A\big)\Big)
\cdot \Big(\big((A \cdot A) \cdot A\big) \cdot \big((A \cdot A) \cdot A\big)\Big)\bigg) \cdot A \\
&= \Big(\big((I \cdot \underset{1}{\underset{\uparrow}{A}})^2 \cdot \underset{1}{\underset{\uparrow}{A}}\big)^2
\cdot \underset{0}{\underset{\uparrow}{I}}\Big)^2 \cdot \underset{1}{\underset{\uparrow}{A}}
\end{aligned}
$$

<figure markdown="block">
{% include_relative generated/fast-repetitions-multiplicative.embedded.svg %}
<figcaption markdown="span">
We can compute A<sup>13</sup> in 5 steps (in green) instead of 12 steps (in blue) by squaring intermediate results.
</figcaption>
</figure>

</div>

</div>

Instead of 12 group operations, we performed only 5 (ignoring the combinations with the identity element).
13 written as a binary number is 1101 (8 + 4 + 1), which corresponds to the pattern of
when you have to combine the intermediate result with the element before doubling/squaring it again.
(If you look at the recursive formula, the least-significant bit determines whether the current number is odd or even
and thus whether you combine the recursive invocation with the element or not before dropping this bit.)

Crucially, this technique works only if you know how many repetitions you have to perform.
If you try to determine the number of repetitions from the result,
you cannot work backwards and halve the number every other step,
which is why this algorithm can be used only in one direction.
I cover the best known algorithms for determining the number of repetitions in a [separate chapter](#dl-algorithms).

<details markdown="block">
<summary markdown="span" id="non-recursive-algorithm">
Non-recursive algorithm
</summary>

The above [recursive algorithm](https://en.wikipedia.org/wiki/Recursion_(computer_science))
can easily be turned into a non-recursive algorithm:

<div class="tabbed text-left pre-background" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
\text{function }repeat(A, n)\ \{ \\
\quad \text{if }(n < 0)\ \{ \\
\quad \quad A := -A \\
\quad \quad n := -n \\
\quad \} \\
\quad \text{let }B := O \\
\quad \text{while }(n > 0)\ \{ \\
\quad \quad \text{if }(n\ \href{#modulo-operation}{\%}\ 2 = 1)\ \{ \\
\quad \quad \quad B := B + A \\
\quad \quad \quad n := n - 1 \\
\quad \quad \} \\
\quad \quad A := A + A \\
\quad \quad n := n / 2 \\
\quad \} \\
\quad \text{return } B \\
\} \\
$$

$$
\text{function }repeat(A, n)\ \{ \\
\quad \text{if }(n < 0)\ \{ \\
\quad \quad A := A^{-1} \\
\quad \quad n := -n \\
\quad \} \\
\quad \text{let }B := I \\
\quad \text{while }(n > 0)\ \{ \\
\quad \quad \text{if }(n\ \href{#modulo-operation}{\%}\ 2 = 1)\ \{ \\
\quad \quad \quad B := B \cdot A \\
\quad \quad \quad n := n - 1 \\
\quad \quad \} \\
\quad \quad A := A \cdot A \\
\quad \quad n := n / 2 \\
\quad \} \\
\quad \text{return } B \\
\} \\
$$

</div>

This function returns the correct result because $$B \cdot A^n$$ (respectively $$B + nA$$) equals the desired result
before and after every [loop iteration](https://en.wikipedia.org/wiki/Control_flow#Loops)
and we repeat the loop until $$n = 0$$.
Unlike the [variant on Wikipedia](https://en.wikipedia.org/wiki/Exponentiation_by_squaring#With_constant_auxiliary_memory),
the above algorithm wastes one group operation in the last iteration when $$n = 1$$.
On the other hand, we don't have to handle the case where $$n = 0$$ separately.
Since computers represent numbers in [binary](https://en.wikipedia.org/wiki/Binary_number),
you can check whether $$n$$ is odd with a [bitwise and](https://en.wikipedia.org/wiki/Bitwise_operation#AND)
(typically written as `n & 1 === 1`) and divide $$n$$ by $$2$$ without having to subtract the
[least-significant bit](https://en.wikipedia.org/wiki/Bit_numbering#Bit_significance_and_indexing) first by
[shifting the bits](https://en.wikipedia.org/wiki/Arithmetic_shift) one to the right (typically written as `n >> 1`).
Since I haven't yet introduced any groups of interest,
I will provide an [interactive tool](/#interactive-tools) for fast repetitions [later on](#repetition-revisited).

</details>


### Group order

A group is [finite](https://en.wikipedia.org/wiki/Finite_group)
if its set contains only a finite number of elements.
The number of elements is then called the [order of the group](https://en.wikipedia.org/wiki/Order_(group_theory)).
If $$\mathbb{G}$$ is the set of the group, its order is usually written as $$|\mathbb{G}|$$,
which is the same notation as used to denote the [cardinality of a set](https://en.wikipedia.org/wiki/Cardinality).

<details markdown="block">
<summary markdown="span" id="notation-for-sets-and-elements">
Notation for sets and elements
</summary>

A [set](https://en.wikipedia.org/wiki/Set_(mathematics)) is a collection
of [distinct elements](https://en.wikipedia.org/wiki/Element_(mathematics)).
When a variable is used to denote a set,
it is often written in [blackboard bold](https://en.wikipedia.org/wiki/Blackboard_bold),
such as $$\mathbb{Z}$$ for the set of [integers](https://en.wikipedia.org/wiki/Integer),
<!-- --> $$\mathbb{R}$$ for the set of [real numbers](https://en.wikipedia.org/wiki/Real_number),
and $$\mathbb{C}$$ for the set of [complex numbers](https://en.wikipedia.org/wiki/Complex_number).
The [symbol $$\in$$](https://en.wikipedia.org/wiki/Element_(mathematics)#Notation_and_terminology)
is used to denote that $$A$$ "is" an element of the set $$\mathbb{G}$$, written as $$A \in \mathbb{G}$$.
I put "is" in quotation marks because the same notation is used when $$A$$ is not an element of the set
but rather a [variable](https://en.wikipedia.org/wiki/Variable_(mathematics)) which represents an element of the set.
Sets are [usually defined](https://en.wikipedia.org/wiki/Set-builder_notation) by enumerating all its elements
within [curly brackets](https://en.wikipedia.org/wiki/Bracket#Curly_bracket), such as $$\{1, 2, 3\}$$,
or by specifying a criteria for its elements after a [vertical bar](https://en.wikipedia.org/wiki/Vertical_bar),
such as $$\{x \in \mathbb{Z} \mid x > 2\}$$ for the set of integers greater than two.

</details>

<details markdown="block">
<summary markdown="span" id="group-order-example">
Group order example
</summary>

As we saw [earlier](#example-of-a-finite-group),
the hours of an analog clock form a finite [group](#group-axioms) under addition.
Using the [above](#group-order) [notations](#notation-for-sets-and-elements),
we write the group as $$\mathbb{G} = \{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11\}$$
and [its order](#group-order) as $$|\mathbb{G}| = 12$$.

</details>


### Element order

If you keep [repeating](#element-repetitions) an element of a finite group,
you will reach an earlier result again at some point because you run out of fresh elements.
Let $$A$$ be the element that we repeat and $$B$$ be the first element that we reach twice,
which we can depict as follows:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
E \circ \overbrace{\underbrace{A \circ A \circ … \circ A\ \vphantom{\large |}}_{m \text{ times}\ =\ B} \circ \underbrace{A \circ … \circ A \vphantom{\large |}}_{n - m \text{ times}\ =\ E}}^{n \text{ times}\ =\ B}
$$

$$
O + \overbrace{\underbrace{A + A + … + A\ \vphantom{\large |}}_{m \text{ times}\ =\ B} + \underbrace{A + … + A \vphantom{\large |}}_{n - m \text{ times}\ =\ O}}^{n \text{ times}\ =\ B}
$$

$$
I \cdot \overbrace{\underbrace{A \cdot A \cdot … \cdot A\ \vphantom{\large |}}_{m \text{ times}\ =\ B} \cdot \underbrace{A \cdot … \cdot A \vphantom{\large |}}_{n - m \text{ times}\ =\ I}}^{n \text{ times}\ =\ B}
$$

</div>

If you reach $$B$$ for the first time after repeating $$A$$ $$m$$ times and again after repeating $$A$$ $$n$$ times,
then $$A$$ repeated $$n - m$$ times has to equal the [identity element](#group-axioms)
because the identity element is the [unique solution](#unique-solution) to $$B \circ X = B$$.
If we start with [zero repetitions](#zero-and-negative-repetitions) and thus the identity element instead of $$A$$,
the identity element has to be the first element which we encounter again
because as soon as $$m > 0$$, $$n - m$$ is smaller than $$n$$,
which means that you reach the identity element before you reach $$B$$ for the second time.
The smallest $$n > 0$$ which results in the identity element when repeating $$A$$ $$n$$ times
is called the [order of the element](https://en.wikipedia.org/wiki/Order_(group_theory)) $$A$$,
written as $$|A|$$:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\underbrace{A \circ … \circ A}_{|A| \text{ times}} = E
$$

$$
(|A|)A = O
$$

$$
A^{|A|} = I
$$

</div>

{:#repeated-group-elements}
In a finite group, every element has a finite order.
Once you've reached the identity element, the elements repeat in the same order:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\overbrace{\underset{A}{\underset{\downarrow}{A}} \circ \underset{B}{\underset{\downarrow}{A}} \circ \underset{C}{\underset{\downarrow}{A}} \circ … \circ \underset{E}{\underset{\downarrow}{A}} \vphantom{\large |}}^{|A| \text{ times}} \circ \underset{A}{\underset{\downarrow}{A}} \circ \underset{B}{\underset{\downarrow}{A}} \circ \underset{C}{\underset{\downarrow}{A}} \circ …
$$

$$
\overbrace{\underset{A}{\underset{\downarrow}{A}} + \underset{B}{\underset{\downarrow}{A}} + \underset{C}{\underset{\downarrow}{A}} + … + \underset{O}{\underset{\downarrow}{A}} \vphantom{\large |}}^{|A| \text{ times}} + \underset{A}{\underset{\downarrow}{A}} + \underset{B}{\underset{\downarrow}{A}} + \underset{C}{\underset{\downarrow}{A}} + …
$$

$$
\overbrace{\underset{A}{\underset{\downarrow}{A}} \cdot \underset{B}{\underset{\downarrow}{A}} \cdot \underset{C}{\underset{\downarrow}{A}} \cdot … \cdot \underset{I}{\underset{\downarrow}{A}} \vphantom{\large |}}^{|A| \text{ times}} \cdot \underset{A}{\underset{\downarrow}{A}} \cdot \underset{B}{\underset{\downarrow}{A}} \cdot \underset{C}{\underset{\downarrow}{A}} \cdot …
$$

</div>

{:#inverse-through-repetitions}
If $$A$$ repeated $$\vert A \vert$$ times results in the identity element,
then $$A$$ repeated $$|A| - 1$$ times has to result in the inverse element of $$A$$:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
A \circ \underbrace{A \circ … \circ A}_{|A| - 1 \text{ times}} = A \circ \overline{A} =
\underbrace{A \circ … \circ A}_{|A| - 1 \text{ times}} \circ A = \overline{A} \circ A = E
$$

$$
A + \underbrace{A + … + A}_{|A| - 1 \text{ times}} = A + (-A) =
\underbrace{A + … + A}_{|A| - 1 \text{ times}} + A = (-A) + A = O
$$

$$
A \cdot \underbrace{A \cdot … \cdot A}_{|A| - 1 \text{ times}} = A \cdot A^{-1} =
\underbrace{A \cdot … \cdot A}_{|A| - 1 \text{ times}} \cdot A = A^{-1} \cdot A = I
$$

</div>

This is the most intuitive way to understand why a right inverse is also always a left inverse and vice versa.

<details markdown="block">
<summary markdown="span" id="element-order-examples">
Element order examples
</summary>

We can determine the [order](#element-order) of every element in the [group](#group-axioms) which corresponds
to an [analog clock](#example-of-a-finite-group) by [repeating each element](#element-repetitions):

<figure markdown="block">

| 1A | 2A | 3A | 4A | 5A | 6A | 7A | 8A | 9A | 10A | 11A | 12A | Order \|A\|
|-
| 0 | | | | | | | | | | | | \|0\| = 1
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 0 | \|1\| = 12
| 2 | 4 | 6 | 8 | 10 | 0 | | | | | | | \|2\| = 6
| 3 | 6 | 9 | 0 | | | | | | | | | \|3\| = 4
| 4 | 8 | 0 | | | | | | | | | | \|4\| = 3
| 5 | 10 | 3 | 8 | 1 | 6 | 11 | 4 | 9 | 2 | 7 | 0 | \|5\| = 12
| 6 | 0 | | | | | | | | | | | \|6\| = 2
| 7 | 2 | 9 | 4 | 11 | 6 | 1 | 8 | 3 | 10 | 5 | 0 | \|7\| = 12
| 8 | 4 | 0 | | | | | | | | | | \|8\| = 3
| 9 | 6 | 3 | 0 | | | | | | | | | \|9\| = 4
| 10 | 8 | 6 | 4 | 2 | 0 | | | | | | | \|10\| = 6
| 11 | 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 | \|11\| = 12
{:.table-with-borders .table-with-vertical-border-after-column-1 .text-nowrap .text-center}

<figcaption markdown="span" style="max-width: 450px;">

The order of each element in the [additive group](#additive-groups) of integers [modulo](#modulo-operation) 12.
(You can set the modulus to an arbitrary value in the [tool below](#additive-group-repetition-table).)

</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="why-do-we-need-invertibility-as-an-axiom">
Why do we need invertibility as an axiom?
</summary>

Since you get the inverse of any element $$A$$ in any finite group simply by repeating $$A$$,
you may wonder why we require each element to have an inverse in the group as one of [our axioms](#group-axioms).
The reason for this is that without invertibility, $$X \circ A = B$$ can have several solutions,
which means that you can get stuck in a loop which doesn't involve the identity element.
(To see this happening, set the [modulus](#modulo-operation) to a [composite number](#prime-factorization)
in the [repetition table of multiplicative groups](#multiplicative-group-repetition-table) below.)
Instead of requiring that each element has an inverse,
we can require that $$X \circ A = B$$ and $$A \circ Y = B$$ have a [unique solution](#unique-solution)
for any elements $$A$$ and $$B$$ of the group.
This is an [alternative definition of a group](#alternative-group-axioms)
and makes even the [identity axiom](#group-axioms) redundant,
as we'll see [later](#latin-square-associativity-group).

</details>


### Group generators

If an element reaches every element of the group before coming to the identity element
when it is [repeated](#element-repetitions),
the element is said to [generate the group](https://en.wikipedia.org/wiki/Generating_set_of_a_group).
Such an element is called a generator and usually denoted as $$G$$.
A group can have several generators or [no generator](#carmichaels-totient-function).
By definition, the [order of each generator](#element-order)
equals the [order of the group](#group-order): $$\lvert G \rvert = \lvert \mathbb{G} \rvert$$.
The set generated by an element $$A$$ is&nbsp;usually written
with [angle brackets](https://en.wikipedia.org/wiki/Bracket#Angle_brackets) as $$⟨A⟩$$.
Also by definition, the set generated by a generator is the whole group: $$\mathbb{G} = ⟨G⟩$$.

<details markdown="block">
<summary markdown="span" id="group-generators-example">
Group generators example
</summary>

As shown in a [previous box](#element-order-examples), the elements $$1$$, $$5$$, $$7$$, and $$11$$ generate
the [additive group](#additive-groups) [modulo](#modulo-operation) 12: $$\mathbb{G} = ⟨1⟩ = ⟨5⟩ = ⟨7⟩ = ⟨11⟩$$.

</details>


### Cyclic groups

A group with a [generator](#group-generators) is called [cyclic](https://en.wikipedia.org/wiki/Cyclic_group)
because all its elements can be reached in a single cycle when [repeating](#element-repetitions) the generator $$G$$:

<figure markdown="block">
{% include_relative generated/cyclic-group.embedded.svg %}
<figcaption markdown="span">

Repeating the generator **G** using the [multiplicative notation](#notation).

</figcaption>
</figure>

Since every element can be written as a repetition of $$G$$,
the group operation and element inversion can be performed as follows:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

Let $$A = aG$$ and $$B = bG$$ be arbitrary elements,
then $$A + B = aG + bG \href{#added-repetitions}{=} (a + b)G$$
and $$-A = -(aG) \href{#cancelled-repetitions}{=} a(-G) \href{#zero-and-negative-repetitions}{=} (-a)G$$.

Let $$A = G^a$$ and $$B = G^b$$ be arbitrary elements,
then $$A \cdot B = G^a \cdot G^b \href{#added-repetitions}{=} G^{a + b}$$
and $$A^{-1} = (G^a)^{-1} \href{#cancelled-repetitions}{=} (G^{-1})^a \href{#zero-and-negative-repetitions}{=} G^{-a}$$.

</div>

Therefore, cyclic groups are [commutative](#commutative-groups)
because the addition of the integers in the repetition of the generator is commutative:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

Let $$A = aG$$ and $$B = bG$$ be arbitrary elements,
then $$A + B = aG + bG = (a + b)G = (b + a)G = bG + aG = B + A$$.

Let $$A = G^a$$ and $$B = G^b$$ be arbitrary elements,
then $$A \cdot B = G^a \cdot G^b = G^{a + b} = G^{b + a} = G^b \cdot G^a = B \cdot A$$.

</div>

<details markdown="block">
<summary markdown="span" id="even-number-of-generators">
Even number of generators
</summary>

Repeating the inverse of $$G$$ generates the group in the opposite direction
because the inverse undoes [one repetition at a time](#cancelled-repetitions):

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
iG = (\lvert G \rvert - (\lvert G \rvert - i))G = \underbrace{(\lvert G \rvert)G}_{=\ O} + (\lvert G \rvert - i)(-G) = (\lvert G \rvert - i)(-G)
$$

$$
G^i = G^{\lvert G \rvert - (\lvert G \rvert - i)} = \underbrace{G^{\lvert G \rvert}}_{=\ I} \cdot (G^{-1})^{\lvert G \rvert - i} = (G^{-1})^{\lvert G \rvert - i}
$$

</div>

As a consequence, every cyclic group with more than two elements has an even number of generators
because the inverse of every generator is also a generator.
(Since each inverse is [unique](#uniqueness-of-inverses)
and the inverse of each inverse is the [original element again](#double-inverse-theorem),
two different generators cannot have the same inverse
— and a generator can equal its inverse only for groups of order 2.)

</details>

<details markdown="block">
<summary markdown="span" id="cyclic-group-example">
Cyclic group example
</summary>

The [group defined by an analog clock](#example-of-a-finite-group) is [cyclic](#cyclic-groups)
and has an [even number of generators](#even-number-of-generators),
namely [$$1$$, $$5$$, $$7 =_{12} -5$$, and $$11 =_{12} -1$$](#group-generators-example).

</details>


### Subgroups

A [group](#group-axioms) $$\mathbb{H}$$ is a [subgroup](https://en.wikipedia.org/wiki/Subgroup)
of another group $$\mathbb{G}$$
if every element of $$\mathbb{H}$$ is also an element of $$\mathbb{G}$$ and they have the same operation.
Since a group must have an [identity element](#group-axioms) and the identity element is defined by the operation,
the subgroup $$\mathbb{H}$$ has to include the same identity element
as the [supergroup](https://en.wiktionary.org/wiki/supergroup) $$\mathbb{G}$$.
Given that the identity element results in itself when it is combined with itself,
every group has a [trivial subgroup](https://en.wikipedia.org/wiki/Trivial_group),
which contains only the identity element.
Since [associativity](#group-axioms) is a property of the operation and not of the elements,
a subgroup satisfies this axiom simply by using the same operation as its supergroup.
[What has to be verified](https://en.wikipedia.org/wiki/Subgroup#Subgroup_tests), though,
is that the elements of the subgroup are [closed](#group-axioms) under the group operation.
If this is the case and the subgroup is non-empty and finite,
the identity element and all inverses are guaranteed to be included
as you reach them by [repeating the corresponding element](#inverse-through-repetitions).
Any element $$A$$ of $$\mathbb{G}$$ [generates](#group-generators) a [cyclic](#cyclic-groups) subgroup,
which is denoted as $$\href{#group-generators}{⟨A⟩}$$.
Generated subsets are always closed because combining repetitions of $$A$$
results in [another repetition of $$A$$](#cyclic-groups).
If $$A$$ does not generate all elements of $$\mathbb{G}$$, then $$⟨A⟩$$ is a proper subgroup of $$\mathbb{G}$$.

<details markdown="block">
<summary markdown="span" id="subgroup-examples">
Subgroup examples
</summary>

The [group defined by an analog clock](#example-of-a-finite-group),
which consists of the elements $$\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11\}$$,
has the following [subgroups](#subgroups): $$\{0\}$$, $$\{0, 6\}$$, $$\{0, 4, 8\}$$, $$\{0, 3, 6, 9\}$$,
<!-- --> $$\{0, 2, 4, 6, 8, 10\}$$, and $$\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11\}$$.
Any other [subset](https://en.wikipedia.org/wiki/Subset) of $$\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11\}$$,
such as $$\{0, 1, 2, 3\}$$, is not [closed](#group-axioms).
(As we'll see [later](#all-subgroups-of-cyclic-groups-are-cyclic),
all subgroups of [cyclic groups](#cyclic-groups) are cyclic.)

</details>

<details markdown="block">
<summary markdown="span" id="notation-for-the-subgroup-relation">
Notation for the subgroup relation
</summary>

As you may have noticed, I began to denote a group by its set in this section.
The [subgroup](#subgroups) [relation](https://en.wikipedia.org/wiki/Relation_(mathematics)) is usually written
as $$\mathbb{H} ≤ \mathbb{G}$$ (or as $$\mathbb{H} < \mathbb{G}$$ if $$\mathbb{H} ≠ \mathbb{G}$$)
instead of $$\mathbb{H} \subseteq \mathbb{G}$$
because not every [subset](https://en.wikipedia.org/wiki/Subset) of elements forms a subgroup.

</details>

<details markdown="block">
<summary markdown="span" id="intersection-of-subgroups-is-a-subgroup">
Intersection of subgroups is a subgroup
</summary>

Given two [subgroups](#subgroups) $$\mathbb{H_1}$$ and $$\mathbb{H_2}$$ of a [group](#group-axioms) $$\mathbb{G}$$,
their [intersection](https://en.wikipedia.org/wiki/Intersection_(set_theory)) $$\mathbb{H} = \mathbb{H_1} \cap \mathbb{H_2}$$
is also a subgroup of $$\mathbb{G}$$ because:
- $$\mathbb{H}$$ is not empty because the [identity element](#group-axioms) $$E$$ of $$\mathbb{G}$$
  is included in both $$\mathbb{H_1}$$ and $$\mathbb{H_2}$$. Therefore, $$E \in \mathbb{H}$$.
- $$\mathbb{H}$$ is [closed](#group-axioms) because for any elements $$A$$ and $$B$$ in $$\mathbb{H}$$,
  <!-- --> $$A$$ and $$B$$ belong to both $$\mathbb{H_1}$$ and $$\mathbb{H_2}$$.<br>
  Since $$\mathbb{H_1}$$ and $$\mathbb{H_2}$$ are closed,
  <!-- --> $$A \circ B \in \mathbb{H_1}$$ and $$A \circ B \in \mathbb{H_2}$$.
  Therefore, $$A \circ B \in \mathbb{H}$$.

On the other hand,
the [union](https://en.wikipedia.org/wiki/Union_(set_theory)) of two subgroups is generally
[not a subgroup](https://en.wikipedia.org/wiki/Subgroup#Basic_properties_of_subgroups).

</details>


### Subgroup cosets

If you combine each element of a [subgroup](#subgroups) $$\mathbb{H}$$
with a fixed element $$A$$ of the supergroup $$\mathbb{G}$$,
you get a [coset](https://en.wikipedia.org/wiki/Coset) of $$\mathbb{H}$$, which is written as:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

- **Right coset**: $$\mathbb{H} \circ A = \{H \circ A \mid H \in \mathbb{H}\}$$,
- **Left coset**: $$A \circ \mathbb{H} = \{A \circ H \mid H \in \mathbb{H}\}$$.

<!-- -->

- **Right coset**: $$\mathbb{H} + A = \{H + A \mid H \in \mathbb{H}\}$$,
- **Left coset**: $$A + \mathbb{H} = \{A + H \mid H \in \mathbb{H}\}$$.

<!-- -->

- **Right coset**: $$\mathbb{H} \cdot A = \{H \cdot A \mid H \in \mathbb{H}\}$$,
- **Left coset**: $$A \cdot \mathbb{H} = \{A \cdot H \mid H \in \mathbb{H}\}$$.

</div>

If the group operation is [commutative](#commutative-groups),
the right coset and the left coset of a subgroup $$\mathbb{H}$$ and an element $$A \in \mathbb{G}$$ are the same.
If the element $$A$$ belongs to the subgroup $$\mathbb{H}$$,
the right coset and the left coset equal the subgroup itself due to [closure](#group-axioms):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\mathbb{H} \circ A = \mathbb{H} = A \circ \mathbb{H}
$$

$$
\mathbb{H} + A = \mathbb{H} = A + \mathbb{H}
$$

$$
\mathbb{H} \cdot A = \mathbb{H} = A \cdot \mathbb{H}
$$

</div>

{:#cosets-are-equal-or-disjoint}
Any two right cosets and any two left cosets are either equal or [disjoint](https://en.wikipedia.org/wiki/Disjoint_sets).
Given arbitrary elements $$A, B \in \mathbb{G}$$, there are two cases:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

1. If $$B \in \mathbb{H} \circ A$$, then $$\mathbb{H} \circ A = \mathbb{H} \circ B$$<br>
   because $$B = H_B \circ A$$ for some $$H_B \in \mathbb{H}$$,
   and thus for every element $$C \in \mathbb{H} \circ B$$,
   there's an $$H_C \in \mathbb{H}$$ so that $$C = H_C \circ B = H_C \circ (H_B \circ A) =  (H_C \circ H_B) \circ A$$,
   where $$H_C \circ H_B \in \mathbb{H}$$ due to [closure](#group-axioms), and thus $$C \in \mathbb{H} \circ A$$.
   So far, we have just shown that $$\mathbb{H} \circ B \subseteq \mathbb{H} \circ A$$.
   Since $$B = H_B \circ A$$, we have that $$A = \overline{H_B} \circ B$$, and thus $$A \in \mathbb{H} \circ B$$.
   This implies that $$\mathbb{H} \circ A \subseteq \mathbb{H} \circ B$$ for the same reason as before.
   Therefore, $$\mathbb{H} \circ A = \mathbb{H} \circ B$$.
2. If $$B \notin \mathbb{H} \circ A$$, then $$\mathbb{H} \circ A \cap \mathbb{H} \circ B = \varnothing$$
   (the [intersection](https://en.wikipedia.org/wiki/Intersection_(set_theory)) of the two cosets
   results in the [empty set](https://en.wikipedia.org/wiki/Empty_set))<br>
   because an overlap would mean that for some element $$C$$,
   there are $$H_A, H_B \in \mathbb{H}$$ so that $$C = H_A \circ A = H_B \circ B$$.
   But in this case, $$B = \overline{H_B} \circ (H_A \circ A) = (\overline{H_B} \circ H_A) \circ A \in \mathbb{H} \circ A$$,
   which [contradicts](https://en.wikipedia.org/wiki/Proof_by_contradiction)
   the [premise](https://en.wikipedia.org/wiki/Premise) of the second case.

<!-- -->

1. If $$B \in \mathbb{H} + A$$, then $$\mathbb{H} + A = \mathbb{H} + B$$<br>
   because $$B = H_B + A$$ for some $$H_B \in \mathbb{H}$$,
   and thus for every element $$C \in \mathbb{H} + B$$,
   there's an $$H_C \in \mathbb{H}$$ so that $$C = H_C + B = H_C + (H_B + A) =  (H_C + H_B) + A$$,
   where $$H_C + H_B \in \mathbb{H}$$ due to [closure](#group-axioms), and thus $$C \in \mathbb{H} + A$$.
   So far, we have just shown that $$\mathbb{H} + B \subseteq \mathbb{H} + A$$.
   Since $$B = H_B + A$$, we have that $$A = (-H_B) + B$$, and thus $$A \in \mathbb{H} + B$$.
   This implies that $$\mathbb{H} + A \subseteq \mathbb{H} + B$$ for the same reason as before.
   Therefore, $$\mathbb{H} + A = \mathbb{H} + B$$.
2. If $$B \notin \mathbb{H} + A$$, then $$\mathbb{H} + A \cap \mathbb{H} + B = \varnothing$$
   (the [intersection](https://en.wikipedia.org/wiki/Intersection_(set_theory)) of the two cosets
   results in the [empty set](https://en.wikipedia.org/wiki/Empty_set))<br>
   because an overlap would mean that for some element $$C$$,
   there are $$H_A, H_B \in \mathbb{H}$$ so that $$C = H_A + A = H_B + B$$.
   But in this case, $$B = (-H_B) + (H_A + A) = ((-H_B) + H_A) + A \in \mathbb{H} + A$$,
   which [contradicts](https://en.wikipedia.org/wiki/Proof_by_contradiction)
   the [premise](https://en.wikipedia.org/wiki/Premise) of the second case.

<!-- -->

1. If $$B \in \mathbb{H} \cdot A$$, then $$\mathbb{H} \cdot A = \mathbb{H} \cdot B$$<br>
   because $$B = H_B \cdot A$$ for some $$H_B \in \mathbb{H}$$,
   and thus for every element $$C \in \mathbb{H} \cdot B$$,
   there's an $$H_C \in \mathbb{H}$$ so that $$C = H_C \cdot B = H_C \cdot (H_B \cdot A) =  (H_C \cdot H_B) \cdot A$$,
   where $$H_C \cdot H_B \in \mathbb{H}$$ due to [closure](#group-axioms), and thus $$C \in \mathbb{H} \cdot A$$.
   So far, we have just shown that $$\mathbb{H} \cdot B \subseteq \mathbb{H} \cdot A$$.
   Since $$B = H_B \cdot A$$, we have that $$A = H_B^{-1} \cdot B$$, and thus $$A \in \mathbb{H} \cdot B$$.
   This implies that $$\mathbb{H} \cdot A \subseteq \mathbb{H} \cdot B$$ for the same reason as before.
   Therefore, $$\mathbb{H} \cdot A = \mathbb{H} \cdot B$$.
2. If $$B \notin \mathbb{H} \cdot A$$, then $$\mathbb{H} \cdot A \cap \mathbb{H} \cdot B = \varnothing$$
   (the [intersection](https://en.wikipedia.org/wiki/Intersection_(set_theory)) of the two cosets
   results in the [empty set](https://en.wikipedia.org/wiki/Empty_set))<br>
   because an overlap would mean that for some element $$C$$,
   there are $$H_A, H_B \in \mathbb{H}$$ so that $$C = H_A \cdot A = H_B \cdot B$$.
   But in this case, $$B = H_B^{-1} \cdot (H_A \cdot A) = (H_B^{-1} \cdot H_A) \cdot A \in \mathbb{H} \cdot A$$,
   which [contradicts](https://en.wikipedia.org/wiki/Proof_by_contradiction)
   the [premise](https://en.wikipedia.org/wiki/Premise) of the second case.

</div>

As different $$H \in \mathbb{H}$$ are mapped to [different elements](#unique-result) in every coset,
all cosets contain the same number of elements, namely [$$|\mathbb{H}|$$](#group-order).

<details markdown="block">
<summary markdown="span" id="subgroup-cosets-example">
Subgroup cosets example
</summary>

Given the [group](#group-axioms) $$\mathbb{G} = \{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11\}$$
with addition [modulo](#modulo-operation) 12, which corresponds to an [analog clock](#example-of-a-finite-group),
the [subgroup](#subgroups) $$\mathbb{H} = \{0, 3, 6, 9\}$$ has the following [cosets](#subgroup-cosets):
<!-- --> $$\mathbb{H} + 0 = \{0, 3, 6, 9\}$$, $$\mathbb{H} + 1 = \{1, 4, 7, 10\}$$,
<!-- --> $$\mathbb{H} + 2 = \{2, 5, 8, 11\}$$, $$\mathbb{H} + 3 = \{3, 6, 9, 0\}$$, and so on.
(You can generate all cosets of a cyclic subgroup [below](#additive-group-subgroup-cosets).)
It's easy to verify that these subgroup cosets are either equal or disjoint
as [proven above](#cosets-are-equal-or-disjoint).
For example, $$\mathbb{H} + 0 = \mathbb{H} + 3$$, whereas $$\mathbb{H} + 1 \cap \mathbb{H} + 2 = \varnothing$$.

</details>


### Lagrange's theorem

[Lagrange's theorem](https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(group_theory))
states that for any finite group $$\mathbb{G}$$,
the [order](#group-order) of every [subgroup](#subgroups) $$\mathbb{H}$$ of $$\mathbb{G}$$
divides the order of $$\mathbb{G}$$.
In other words, if $$\mathbb{H}$$ is a subgroup of $$\mathbb{G}$$, $$|\mathbb{G}|$$ is a
[multiple](https://en.wikipedia.org/wiki/Multiple_(mathematics)) of $$|\mathbb{H}|$$.
Since each element $$A \in \mathbb{G}$$ belongs to a [coset](#subgroup-cosets) of $$\mathbb{H}$$
($$A \in \mathbb{H} \circ A$$)
and all cosets of $$\mathbb{H}$$ are either equal or disjoint and contain the same number of elements,
the cosets of $$\mathbb{H}$$ split the group $$\mathbb{G}$$
into [subsets](https://en.wikipedia.org/wiki/Subset) of equal size:

<figure markdown="block">
{% include_relative generated/subgroup-cosets.embedded.svg %}
<figcaption markdown="span">

The cosets of $$\mathbb{H}$$ form a [partition](https://en.wikipedia.org/wiki/Partition_of_a_set)
of the supergroup $$\mathbb{G}$$<br>
(i.e. every element of $$\mathbb{G}$$ is included in exactly one coset).

</figcaption>
</figure>

Since $$\mathbb{H}$$ is a coset of $$\mathbb{H}$$,
it follows that $$|\mathbb{H}|$$ divides $$|\mathbb{G}|$$.
This theorem is named after [Joseph-Louis Lagrange](https://en.wikipedia.org/wiki/Joseph-Louis_Lagrange) (1736 − 1813).

{:#lagrange-consequences}
Lagrange's theorem has several important consequences:
1. The [order](#element-order) of every element $$A$$ in $$\mathbb{G}$$ divides the order of $$\mathbb{G}$$
   because $$A$$ [generates](#group-generators) the [subgroup](#subgroups) $$\href{#group-generators}{⟨A⟩}$$,
   where $$|⟨A⟩| = |A|$$.
2. Any element $$A$$ in $$\mathbb{G}$$
   repeated $$|\mathbb{G}|$$ times equals the [identity element](#group-axioms)
   because with $$|\mathbb{G}| = |A| \cdot n$$ for some integer $$n$$:
   <div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

   $$
   (|\mathbb{G}|)A = (|A| \cdot n)A = n((|A|)A) = nO = O
   $$

   $$
   A^{|\mathbb{G}|} = A^{|A| \cdot n} = (A^{|A|})^n = I^n = I
   $$

   </div>
3. Every group of [prime](#prime-factorization) order is [cyclic](#cyclic-groups),
   and every element except the identity element is a [generator](#group-generators).
   (Given a group $$\mathbb{G}$$ where $$|\mathbb{G}|$$ is prime,
   the order of every $$A \in \mathbb{G}$$ has to be $$1$$ or $$|\mathbb{G}|$$.
   If its order is $$1$$, $$A$$ is the identity element.
   If its order is $$|\mathbb{G}|$$, $$A$$ is a generator.)

<details markdown="block">
<summary markdown="span" id="lagranges-theorem-example">
Lagrange's theorem example
</summary>

We determined the [order](#element-order) of every element in the [group](#group-axioms) which corresponds
to an [analog clock](#example-of-a-finite-group) [earlier](#element-order-examples).
It's easy to verify that the order of each element divides the [group's order](#group-order-example).
Since these [generated](#cyclic-groups) [subgroups](#subgroups) are the only possible subgroups
as explained [later on](#all-subgroups-of-cyclic-groups-are-cyclic),
the order of [every subgroup](#subgroup-examples) divides the group's order.
And since $$12A$$ is a multiple of $$12$$ for any element $$A$$,
we have that $$12A =_{12} 0$$ for all elements of the group
as implied by the [second consequence](#lagrange-consequences) of [Lagrange's theorem](#lagranges-theorem).

</details>

<details markdown="block">
<summary markdown="span" id="index-and-cofactor">
Index and cofactor
</summary>

Given a group $$\mathbb{G}$$ and a subgroup $$\mathbb{H}$$,
the ratio $$\frac{|\mathbb{G}|}{|\mathbb{H}|}$$ is called the
[index of the subgroup](https://en.wikipedia.org/wiki/Index_of_a_subgroup)
or the [cofactor](https://en.wikipedia.org/wiki/Cofactor) in the case of [elliptic curves](#elliptic-curves).

</details>

<details markdown="block">
<summary markdown="span" id="proof-without-cosets-for-commutative-groups">
Proof without cosets for commutative groups
</summary>

If we restrict our attention to [commutative groups](#commutative-groups),
there's a much simpler proof for why you get the [identity element](#group-axioms)
when you [repeat an element](#element-repetitions) of such a group as many times as there are elements in the group.
(I found this proof on page 34 of [Victor Shoup's book](https://shoup.net/ntb/ntb-v2.pdf).)
Since you get [different results](#unique-result)
when you combine an element $$A$$ with two different elements $$B_1$$ and $$B_2$$,
<!-- --> $$f(X) = A \circ X$$ is an [invertible function](https://en.wikipedia.org/wiki/Bijection).
This means that $$f(X)$$ is a [permutation](#permutations),
and thus $$f(\mathbb{G}) = \{f(B) \mid B \in \mathbb{G}\} = \mathbb{G}$$.
Using [Greek letters](#sum-and-product-of-similar-terms) to iterate over all the elements of a commutative group,
we can observe the following:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
\sum_{B \in \mathbb{G}} B
= \sum_{B \in \mathbb{G}} f(B)
= \sum_{B \in \mathbb{G}} A + B
= (|\mathbb{G}|)A + \Big( \sum_{B \in \mathbb{G}} B \Big) \\[8pt]
\textsf{After canceling } \sum_{B \in \mathbb{G}} B \textsf{ on both sides, we have that } O = (|\mathbb{G}|)A \textsf{.}
$$

$$
\prod_{B \in \mathbb{G}} B
= \prod_{B \in \mathbb{G}} f(B)
= \prod_{B \in \mathbb{G}} A \cdot B
= A^{|\mathbb{G}|} \cdot \Big( \prod_{B \in \mathbb{G}} B \Big) \\[8pt]
\textsf{After canceling } \prod_{B \in \mathbb{G}} B \textsf{ on both sides, we have that } I = A^{|\mathbb{G}|} \textsf{.}
$$

</div>

You can replace $$B$$ with $$f(B)$$ and aggregate all $$A$$
outside the [loop](https://en.wikipedia.org/wiki/Control_flow#Loops)
only if the operation of the group is [commutative](#commutative-groups).
The [order of every element](#element-order) has to divide the [order of the group](#group-order)
because it cannot be larger and you wouldn't get the identity element
if $$|\mathbb{G}|$$ was not a multiple of $$|A|$$.
To make similar statements about non-commutative groups and [non-cyclic subgroups](#non-cyclic-subgroups-of-non-cyclic-groups),
you still need [Lagrange's theorem](#lagranges-theorem) with its [cosets](#subgroup-cosets).
This is probably why this proof is not more popular;
but it is enough for our purposes.

</details>


## Modular arithmetic

Before we can look at some examples of [finite groups](#finite-groups),
we have to learn about [modular arithmetic](https://en.wikipedia.org/wiki/Modular_arithmetic) first.


### Euclidean division

[Integers](https://en.wikipedia.org/wiki/Integer)
aren't [closed](https://en.wikipedia.org/wiki/Closure_(mathematics))
under [division](https://en.wikipedia.org/wiki/Division_(mathematics)),
but you can divide any two integers with a [remainder](https://en.wikipedia.org/wiki/Remainder),
which is known as [Euclidean division](https://en.wikipedia.org/wiki/Euclidean_division).
Given a positive integer $$d > 0$$, every integer $$n$$ can be written as $$n = q \cdot d + r$$,
where $$q$$ and $$r$$ are integers and $$0 ≤ r < d$$.
In this equation,
<!-- --> $$n$$ is called the [dividend](https://en.wiktionary.org/wiki/dividend) (the quantity to be divided),
<!-- --> $$d$$ is called the [divisor](https://en.wiktionary.org/wiki/divisor) (the quantity which divides),
<!-- --> $$q$$ is called the [quotient](https://en.wiktionary.org/wiki/quotient)
(how many times the divisor is included in the dividend),
and $$r$$ is called the [remainder](https://en.wiktionary.org/wiki/remainder) (the quantity which is left over).

Since the divisor $$d$$ splits the [number line](https://en.wikipedia.org/wiki/Number_line) into equal sections,
the quotient $$q$$ and the remainder $$r$$ are unique:

<figure markdown="block">
{% include_relative generated/modulo-line-positive.embedded.svg %}
<figcaption markdown="span">
The divisor $$d$$ divides the number line for positive integers.
</figcaption>
</figure>

Personally, I'm satisfied with this geometric argument.
You find a more formal proof for the existence and the uniqueness of $$q$$ and $$r$$
on [Wikipedia](https://en.wikipedia.org/wiki/Euclidean_division#Proof).
Since we are interested in positive divisors only, I didn't bother to define Euclidean division for a negative $$d$$.
What we do care about, though, is that the remainder $$r$$ is
[non-negative](https://en.wikipedia.org/wiki/Sign_(mathematics)#non-negative_and_non-positive)
(i.e. greater than or equal to zero) even if the integer $$n$$ is negative:

<figure markdown="block">
{% include_relative generated/modulo-line-negative.embedded.svg %}
<figcaption markdown="span">
The divisor $$d$$ also divides the number line for negative integers.
</figcaption>
</figure>

<details markdown="block">
<summary markdown="span" id="divisor">
Divisor
</summary>

An integer $$d$$ which divides another integer $$n$$ without a remainder
is a co-called [divisor](https://en.wikipedia.org/wiki/Divisor) of $$n$$.
This is usually written as $$d \mid n$$,
which means that there is an integer $$c$$ so that $$c \cdot d = n$$.
In this context, the term "divisor" is used differently than in the [Euclidean division](#euclidean-division) above.

</details>


### Modulo operation

The [modulo operation](https://en.wikipedia.org/wiki/Modulo_operation)
returns the remainder of [Euclidean division](#euclidean-division).
The divisor of the division is also called
the [modulus](https://en.wiktionary.org/wiki/modulus#Latin) (a small measure or interval) of the operation.
The modulo operation is [typically written as](https://en.wikipedia.org/wiki/Modulo_operation#Notation)
<!-- --> $$n \text{ mod } m$$ or $$n\ \%\ m$$, where $$n$$ is the dividend and $$m$$ is the modulus.
For example, $$8\ \%\ 3 = 2$$.
Many calculators, including [Google Search](https://en.wikipedia.org/wiki/Google_Search)
and [Apple Spotlight](https://en.wikipedia.org/wiki/Spotlight_(software)),
support the modulo operation in both notations
but struggle if you make the numbers large enough
(because some use [floating-point arithmetic](https://en.wikipedia.org/wiki/Floating-point_arithmetic)).
Since we want to perform calculations with very large integers in cryptography,
it's time for the first [interactive tool](/#interactive-tools) of this article:

<div id="tool-integer-modulo"></div>

<details markdown="block">
<summary markdown="span" id="modulo-in-programming-languages">
Modulo in programming languages
</summary>

In many [programming languages](https://en.wikipedia.org/wiki/Programming_language),
including [C](https://en.wikipedia.org/wiki/C_(programming_language)),
[C++](https://en.wikipedia.org/wiki/C%2B%2B),
[Go](https://en.wikipedia.org/wiki/Go_(programming_language)),
[Java](https://en.wikipedia.org/wiki/Java_(programming_language)),
and [JavaScript](https://en.wikipedia.org/wiki/JavaScript),
the `%` operator does not compute the remainder as [presented here](#euclidean-division).
Instead, these languages round the quotient towards zero and allow the remainder to be negative, which is listed
as truncated division on [Wikipedia](https://en.wikipedia.org/wiki/Modulo_operation#In_programming_languages).
For example, `-7 % 2 == -1`,
which means that you [cannot test](https://en.wikipedia.org/wiki/Modulo_operation#Common_pitfalls)
whether a potentially negative integer is odd by using `n % 2 == 1`.
For the quotient, this behavior is probably desirable,
which is why signed division is implemented like this
in the `IDIV` instruction of the [x86](https://en.wikipedia.org/wiki/X86)
[instruction set](https://en.wikipedia.org/wiki/Instruction_set_architecture).
The situation becomes even more complicated if you allow the divisor/modulus to be negative.

</details>


### Equivalence relation

When two numbers have the same [remainder](#euclidean-division),
we say that they are equivalent up to a multiple of the modulus,
which means that their difference is a multiple of the modulus.
Given the numbers $$a$$ and $$b$$, this is usually written in one of the following two ways:

{:.aligned}
$$
\begin{aligned}
a &\equiv b \pmod m \\
\textsf{or} \quad a &\equiv_m b
\end{aligned}
$$

I prefer the latter to the former because it makes it clearer
that the aspect which is affected by the modulus is the comparison of the two numbers.
The second notation is also more flexible as it allows us to use the modular comparison
and the [ordinary equality](https://en.wikipedia.org/wiki/Equality_(mathematics))
in a [single line](#index-calculus-algorithm).
Since the third dash increases the load on our eyes
(similar to [visual pollution](https://en.wikipedia.org/wiki/Visual_pollution))
without any benefits, I will simply write:

$$
a =_m b
$$

The reason for not dropping the modulus in the [subscript](https://en.wikipedia.org/wiki/Subscript_and_superscript)
of the [equals sign](https://en.wikipedia.org/wiki/Equals_sign) as well is
that the modulus is a useful reminder of whether we perform a computation with simple numbers
in the [modular group](#multiplicative-groups) or the [repetition ring](#repetition-ring).
If a computation is performed with something else,
such as [points](#point-addition) or [polynomials](https://en.wikipedia.org/wiki/Polynomial),
we will leave the meaning of the equals sign to the context in which it is used.

We have now five different ways to express the same [relation](https://en.wikipedia.org/wiki/Relation_(mathematics))
between two integers $$a$$ and $$b$$:

$$
a\ \%\ m = b\ \%\ m
\enspace \iff \enspace a =_m b
\enspace \iff \enspace (a - b)\ \%\ m = 0
\enspace \iff \enspace m \href{#divisor}{\mid} (a - b)
\enspace \iff \enspace a = b + c \cdot m \textsf{ for some integer } c
$$

{:#equivalence-properties}
Equality of remainders is an [equivalence relation](https://en.wikipedia.org/wiki/Equivalence_relation),
which is defined by the following three properties given any numbers $$a$$, $$b$$, and $$c$$:
- [**Reflexivity**](https://en.wikipedia.org/wiki/Reflexive_relation):
  $$a =_m a$$.
- [**Symmetry**](https://en.wikipedia.org/wiki/Symmetric_relation):
  If $$a =_m b$$, then $$b =_m a$$.
- [**Transitivity**](https://en.wikipedia.org/wiki/Transitive_relation):
  If $$a =_m b$$ and $$b =_m c$$, then $$a =_m c$$.

These properties are satisfied when considering only the remainder of numbers
because the remainder is unique for every number.


### Congruence relation

The above [equivalence relation](#equivalence-relation) is compatible with
[addition](https://en.wikipedia.org/wiki/Addition) and [multiplication](https://en.wikipedia.org/wiki/Multiplication)
in the sense that equivalent inputs yield equivalent outputs:
For any integers $$a_1$$, $$a_2$$, $$b_1$$, and $$b_2$$ so that $$a_1 =_m a_2$$ and $$b_1 =_m b_2$$
(i.e. $$a_1 = a_2 + c_a \cdot m$$ and $$b_1 = b_2 + c_b \cdot m$$ for some integers $$c_a$$ and $$c_b$$),
we have that
- $$a_1 + b_1 =_m a_2 + b_2$$
  because $$a_1 + b_1 = (a_2 + c_a \cdot m) + (b_2 + c_b \cdot m) = (a_2 + b_2) + (c_a + c_b) \cdot m$$, and
- $$ a_1 \cdot b_1 =_m a_2 \cdot b_2$$
  because $$a_1 \cdot b_1 = (a_2 + c_a \cdot m) \cdot (b_2 + c_b \cdot m)
  = (a_2 \cdot b_2) + (a_2 \cdot c_b + c_a \cdot b_2 + c_a \cdot c_b \cdot m) \cdot m$$.

An equivalence relation which is compatible with the operations of interest
is a [congruence relation](https://en.wikipedia.org/wiki/Congruence_relation).
Calculating modulo $$m$$ therefore means that we can eliminate multiples of $$m$$ without affecting the equivalence relation.
Since only the remainders are relevant, we can – and will – represent all numbers by their unique remainder.
Instead of reinterpreting what it means to be equal,
we could just as well [overload the operators](https://en.wikipedia.org/wiki/Operator_overloading)
so that $$a +_m b = (a + b)\ \%\ m$$ and $$a \cdot_m b = (a \cdot b)\ \%\ m$$.
This is an [adequate way to think about modular arithmetic](#quotient-rings)
and also how I [implemented the following tools](https://github.com/KasparEtter/ef1p/tree/main/code/math).
Regarding notation, it's better to keep the modulus next to the equals sign, though,
because it makes longer expressions easier to read.
Moreover, some operations,
such as [modular exponentiation](https://en.wikipedia.org/wiki/Modular_exponentiation),
are written without an operator to which the modulus could be attached.


## Additive groups

After having gone through quite a bit of theory,
the time has finally come to see some [finite groups](#finite-groups) in action.
The integers modulo some integer $$m$$ form a [commutative group](#commutative-groups)
under [addition](https://en.wikipedia.org/wiki/Addition).
As explained in the [previous chapter](#modular-arithmetic),
you can either define the set of the group to contain all the integers
and redefine what it [means to be equal](#equivalence-relation),
or restrict the set of elements to $$\{0, 1, …, m - 1\}$$
and [redefine addition](#congruence-relation) as $$A +_m B = (A + B)\ \href{#modulo-operation}{\%}\ m$$.
The latter is usually preferred because it makes the representation of elements unique.
The number of elements is given by the modulus $$m$$.
It's easy to see why addition modulo $$m$$ satisfies the four [group axioms](#group-axioms):
- **Closure**:
  Every integer has a [remainder](#euclidean-division) between $$0$$ and $$m - 1$$ (both inclusive).
  It's not possible to leave the set of elements.
- **Associativity**:
  Since reducing intermediate results to their remainder [doesn't change the result](#congruence-relation),
  addition [remains associative](https://en.wikipedia.org/wiki/Addition#Associativity).
- **Identity**:
  The number $$0$$ is the only [identity element](https://en.wikipedia.org/wiki/Addition#Identity_element).
  For any number $$A$$, we have that $$A + 0 = 0 + A = A$$.
- **Invertibility**:
  The inverse of any number $$A$$ is $$m - A$$ because $$A + (m - A) =_m 0$$.

The combinations of elements can be displayed in an [operation table](#additive-group-operation-table)
and the [repetitions of each element](#element-repetitions) in a [repetition table](#additive-group-repetition-table).


### Operation table {#additive-group-operation-table}

An operation table is a [mathematical table](https://en.wikipedia.org/wiki/Mathematical_table)
which lists the results of combining any two elements
with a [binary operation](https://en.wikipedia.org/wiki/Binary_operation).
If the table is exhaustive, it defines the operation by [enumeration](https://en.wikipedia.org/wiki/Enumeration).
You likely had to learn the [multiplication table](https://en.wikipedia.org/wiki/Multiplication_table)
up to a factor of 10 by heart in [primary school](https://en.wikipedia.org/wiki/Primary_school),
and you might also be familiar with [truth tables](https://en.wikipedia.org/wiki/Truth_table),
which are used to define [truth functions](https://en.wikipedia.org/wiki/Truth_function).
In the case of [groups](#finite-groups),
an operation table is also called a group table, a composition table,
or a [Cayley table](https://en.wikipedia.org/wiki/Cayley_table),
named after [Arthur Cayley](https://en.wikipedia.org/wiki/Arthur_Cayley) (1821 − 1895).
Just to be clear, an operation table has nothing to do
with an [operating table](https://en.wikipedia.org/wiki/Operating_table).

The following tool allows you to generate the operation table
for all [additive groups](#additive-groups) up to a modulus of 100:

<div id="tool-table-additive-group-operation"></div>

All the elements which are [coprime](#multiset-of-prime-factors) with the modulus
are highlighted with a green background in the first row and the first column.
We'll discuss the properties of operation tables when we look at [multiplicative groups](#multiplicative-groups),
where the tables are a bit more interesting.


### Repetition table {#additive-group-repetition-table}

Most of the [introduction to group theory](#finite-groups)
was about [combining the same element with itself repeatedly](#element-repetitions).
We learned that the [identity element](#group-axioms) is reached before another element occurs twice
and that this [element order](#element-order) divides the [group order](#group-order).
You can observe both properties for moduli up to 100 in the tool below,
where each element is repeated in a separate row until it reaches the identity element.
Such tables aren't commonly used to visualize [Lagrange's theorem](#lagranges-theorem)
and other properties, such as [the number of generators](#number-of-generators-in-cyclic-groups).
I call them repetition tables, but feel free to refer to them as [Etter tables](/#about). 😉

<div id="tool-table-additive-group-repetition"></div>

The first row indicates how many times the element in the first column was repeated.
(Remember that repeated addition is [written as multiplication](#element-repetitions).)
The tool highlights all the repetitions which divide the number of elements in the group with a blue background.
These are the columns in which the identity element can be reached in the repetitions below.
You can increase and decrease the modulus by pressing
the up and down [arrow keys](https://en.wikipedia.org/wiki/Arrow_keys) of your keyboard
when the [cursor](https://en.wikipedia.org/wiki/Cursor_(user_interface))
is in the [input field](https://en.wikipedia.org/wiki/Text_box).

In the case of additive groups,
the following properties are easy to understand even if you don't know anything about [group theory](#finite-groups):
- **Group order**: A multiple of the modulus is obviously [congruent](#congruence-relation) to zero,
  i.e. $$mA =_m 0$$ for any number $$A$$.
  This was also [one of the consequences](#lagrange-consequences) of [Lagrange's theorem](#lagranges-theorem).
  You can observe it in the repetition table above by [enabling "Repeat"](#tool-table-additive-group-repetition&repeat=true).
- **Prime modulus**: If the modulus $$m$$ is [prime](#prime-factorization),
  you won't get a multiple of $$m$$ until you repeat any element except zero $$m$$ times.
  Since you cannot hit some element twice [before reaching the identity element](#element-order),
  all elements except zero [generate the whole group](#group-generators).
- **Cyclic groups**: Additive groups modulo some number are always [cyclic](#cyclic-groups)
  because the number 1 always generates the whole group.
- **Gray element**: If the modulus $$m$$ is even, the element $$\frac{m}{2}$$ has an order of two.
  An order of two means that $$\frac{m}{2}$$ is [its own inverse](#even-number-of-generators).
  All other elements except zero have an order greater than two
  because for all elements $$A < \frac{m}{2}$$, we have that $$2A < m$$,
  and for all elements $$A > \frac{m}{2}$$, we have that $$m < 2A < 2m$$.
  Thus, whenever an element has an even order
  (which can be the case [only if $$m$$ is even](#lagranges-theorem)),
  you reach $$\frac{m}{2}$$ halfway to the identity element.
  To make it easier to see this, the tool marks $$\frac{m}{2}$$ with a gray background.

You can ignore the additional options of the tool for now;
we'll make use of them [later on](#sum-of-eulers-totient-function-over-divisors).


### Subgroup cosets {#additive-group-subgroup-cosets}

As we learned [above](#lagranges-theorem),
the order of every subgroup divides the order of the group
because the [cosets of a subgroup](#subgroup-cosets) are either equal or disjoint
and all elements of the group belong to a coset of a particular subgroup.
The following tool demonstrates this for additive groups modulo some number.
The first row contains the elements of the subgroup which is [generated](#group-generators) by the given element.
It corresponds to the row of the given element in the group's [repetition table](#additive-group-repetition-table)
with the difference that the identity element comes first instead of last.
The second row contains the elements of the first row incremented by one,
the third row contains the elements of the first row incremented by two, and so on.
The reason why I put the identity element into the first column is
to make it easy to recognize which coset is represented by a particular row.

<div id="tool-cosets-additive-group"></div>

For example, [setting the modulus to 9 and the element to 3](#tool-cosets-additive-group&modulus=9&element=3&unique=false),
the first row is $$\href{#group-generators}{⟨3⟩} = \{0, 3, 6\}$$,
the second row is $$⟨3⟩ + 1 = \{0 + 1 = 1, 3 + 1 = 4, 6 + 1 = 7\}$$, and so on.
If the element in the first column appears in another row,
then the elements in these two rows are identical, they just appear in a different order.
If the element in the first column does not appear in another row,
then the two rows have no elements in common.
You can filter all the rows whose elements already appeared in the table
by [enabling "Unique"](#tool-cosets-additive-group&unique=true).
In order to make it easier to spot that each element appears exactly once when "Unique" is enabled,
the elements of the group are highlighted with a blue background one after the other.
You can disable this animation by [setting the delay to 0](#tool-cosets-additive-group&delay=0).

<details markdown="block">
<summary markdown="span" id="visualization-of-cosets">
Visualization of cosets
</summary>

For additive groups modulo some number,
even the fact that a group is partitioned by [subgroup cosets](#subgroup-cosets) is somewhat intuitive:

<figure markdown="block">
{% include_relative generated/additive-group-modulo-9.embedded.svg %}
<figcaption markdown="span">

The subgroup generated by the element 3 in red<br>
with the two disjoint cosets in orange and yellow.

</figcaption>
</figure>

Admittedly, this is the simplest possible case.
What happens if you don't hit $$0$$ in the first pass and have to do more loops?
If you repeat an element from the left side of the circle,
then you just reach the elements in the opposite order
(e.g. $$(6 + 6)\ \%\ 9 = 3$$ and $$(3 + 6)\ \%\ 9 = 0$$).
For a more sophisticated example, let's look at the
[additive group modulo 14 with the element 6](#tool-cosets-additive-group&modulus=14&element=6&unique=true):

<figure markdown="block">
{% include_relative generated/additive-group-modulo-14.embedded.svg %}
<figcaption markdown="span">

The subgroup generated by the element 6 in red<br>
with the only disjoint coset in orange.

</figcaption>
</figure>

As you can see in the above graphic,
the distance between adjacent elements of the subgroup is always the same.
This has to be the case because repeating an element generates a [cyclic](#cyclic-groups) [subgroup](#subgroups),
which is [closed](#group-axioms).
As a consequence, the difference between the two closest elements is itself an element.
(If we denote the closest elements as $$A$$ and $$B$$,
then $$B + (-A)$$ is also an element of the subgroup due to closure.)
This difference can then be added and subtracted from all other elements.
If this leads to an even smaller gap, you repeat this procedure until the subgroup is closed.
If the original element does not generate the whole group,
you get a disjoint coset when you rotate the generated subgroup by one.
As we'll see [later](#bezouts-identity), the difference between adjacent elements of the generated subgroup
equals the [greatest common divisor](#greatest-common-divisor) of the generating element and the modulus,
and the first time you hit zero again corresponds to the [least common multiple](#least-common-multiple) of these two numbers.

</details>


### Group notations {#additive-group-notations}

The additive group of integers modulo some number $$m$$ is usually denoted
as $$(\mathbb{Z}/m\mathbb{Z})^+$$ or $$\mathbb{Z}_m^+$$.
(By convention, $$\mathbb{Z}$$ stands for the [set of all integers](https://en.wikipedia.org/wiki/Integer).
The letter comes from the German word for numbers, which is [Zahlen](https://en.wiktionary.org/wiki/Zahlen).)
The former notation refers to the additive group of the [quotient ring](#quotient-rings) $$\mathbb{Z}/m\mathbb{Z}$$.
Since the second notation is also used for a
[different mathematical concept](https://en.wikipedia.org/wiki/P-adic_number#p-adic_integers),
mathematicians typically prefer the former, whereas cryptographers tend to settle for the latter.


## Multiplicative groups

The integers modulo some integer $$m$$ can also be combined
using [multiplication](https://en.wikipedia.org/wiki/Multiplication),
which results in the so-called
[multiplicative group of integers modulo $$m$$](https://en.wikipedia.org/wiki/Multiplicative_group_of_integers_modulo_n).
Since [equivalence up to a multiple of $$m$$](#equivalence-relation)
is [preserved also under multiplication](#congruence-relation),
it's easy to see why modular multiplication is still [associative](#group-axioms).
It's also rather obvious that the number $$1$$ is the identity element
because for any number $$A$$, $$A \cdot 1 = 1 \cdot A = A$$.
Since there is no number $$B$$ for which $$0 \cdot B =_m 1$$, $$0$$ has to be excluded from the set of elements.
What remains to be seen is which other numbers below the modulus have an inverse
and why the group is closed if the numbers without an inverse are excluded.
The short answer is that integers have a [multiplicative inverse](#modular-multiplicative-inverse)
[if and only if](#if-and-only-if) the only [factor in common](#greatest-common-divisor) with the modulus is $$1$$.
We will see in the [next chapter](#multiplicative-inverse-revisited) why this is the case.
For now, just be aware that the following tools do not always display groups.
If the modulus is not prime, you have to enable the "[coprime](#multiset-of-prime-factors) filter" to get a group.
This is the reason why [prime numbers](#prime-factorization) play such an important role in number theory and cryptography.

<details markdown="block">
<summary markdown="span" id="if-and-only-if">
If and only if
</summary>

Given two statements $$P$$ and $$Q$$,
"$$P$$ [if and only if](https://en.wikipedia.org/wiki/If_and_only_if) $$Q$$"
means that either both statements are true or neither of them is.
In other words, $$P$$ is
[necessary and sufficient](https://en.wikipedia.org/wiki/Necessity_and_sufficiency#Simultaneous_necessity_and_sufficiency)
for $$Q$$ (and the other way around),
which means that each statement [implies the other](#material-implication).
In formulas,
this so-called [material equivalence](https://en.wikipedia.org/wiki/If_and_only_if) is usually written as $$\iff$$,
which is a [binary truth function](https://en.wikipedia.org/wiki/Truth_function#Table_of_binary_truth_functions)
with the following [truth table](https://en.wikipedia.org/wiki/Truth_table)
(using [$$\top$$](https://en.wikipedia.org/wiki/Tee_(symbol)) for true
and [$$\bot$$](https://en.wikipedia.org/wiki/Up_tack) for false):

<figure markdown="block">

| $$P$$ | $$Q$$ | $$P \iff Q$$
|:-:|:-:|:-:
| $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-green}{\top}$$
| $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-red}{\bot}$$
| $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$
| $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$
{:.table-with-vertical-border-after-column-2}

<figcaption markdown="span">
The definition of $$\iff$$.
</figcaption>
</figure>

</details>


### Operation table {#multiplicative-group-operation-table}

The following tool allows you to generate the [operation table](#additive-group-operation-table)
for all [multiplicative groups](#multiplicative-groups) up to a modulus of 100:

<div id="tool-table-multiplicative-group-operation"></div>

Operation tables of groups, which are also known as [Cayley tables](https://en.wikipedia.org/wiki/Cayley_table),
have [some](#symmetries) [interesting](#permutations) [properties](#identity-row-and-column).
I limited the modulus to 100 not because these properties no longer hold for larger moduli
but because the operation table becomes unwieldy way before that.


#### Symmetries

The table is symmetric along the diagonal axis from the upper left corner to the lower right corner
[if and only if](#if-and-only-if) the operation is [commutative](#commutative-groups)
and the elements are listed in the same order in both dimensions.
All the groups that we are interested in are commutative.
If the operation is not commutative,
[the convention is](https://en.wikipedia.org/wiki/Cayley_table#Structure_and_layout)
that the first element determines the row and the second element determines the column of the table.
If you play with the [above tool](#tool-table-multiplicative-group-operation),
you notice that the table is also symmetric along the diagonal axis from the lower left corner to the upper right corner.
The reason for this is that the product of two negative numbers is the same
as the product of the corresponding positive numbers:
<!-- --> $$A \cdot B = B \cdot A = (-B) \cdot (-A) =_m (m - B) \cdot (m - A)$$.
This second symmetry is specific to [multiplicative groups](#multiplicative-groups),
which you can verify by going back to the [additive groups](#additive-group-operation-table).


#### Permutations

The [group axioms](#group-axioms) imply that $$A \circ X = B$$ and $$Y \circ A = B$$
have [unique solutions](#unique-solution) for any elements $$A$$ and $$B$$ of the group.
This means that each row and column of a group's operation table may contain each element only once.
Otherwise, the solution is not unique:

<figure markdown="block">

<table class="table-with-borders table-with-vertical-border-after-column-1 text-nowrap square-cells">
  <thead>
    <tr>
      <th>∘</th>
      <th>⋯</th>
      <th>X<sub>1</sub></th>
      <th>⋯</th>
      <th>X<sub>2</sub></th>
      <th>⋯</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>⋮</th>
      <td></td>
      <td>⋮</td>
      <td></td>
      <td>⋮</td>
      <td></td>
    </tr>
    <tr>
      <th>A</th>
      <td>⋯</td>
      <td class="background-color-red">B</td>
      <td>⋯</td>
      <td class="background-color-red">B</td>
      <td>⋯</td>
    </tr>
    <tr>
      <th>⋮</th>
      <td></td>
      <td>⋮</td>
      <td></td>
      <td>⋮</td>
      <td></td>
    </tr>
  </tbody>
</table>

<figcaption markdown="span" style="max-width: 400px;">
A row (or column) may not contain the same element twice
as $$A \circ X = B$$ would have more than one solution otherwise.
</figcaption>
</figure>

Due to [closure](#group-axioms), each combination of two elements results in another element.
Therefore, none of the cells may be empty and each row and column has to contain each element
[exactly once](https://en.wikipedia.org/wiki/Pigeonhole_principle#Alternative_formulations).
In other words, the rows and columns are [permutations](https://en.wikipedia.org/wiki/Permutation) of the group's elements
and the operation table forms a so-called [Latin square](https://en.wikipedia.org/wiki/Latin_square),
where each symbol occurs exactly once in each row and column.


#### Identity row and column

Since groups have an identity element,
one of the rows has to match the column headers
and one of the columns has to match the row headers.
Put differently, the [identity permutation](https://en.wikipedia.org/wiki/Permutation_group#Neutral_element_and_inverses),
which maps every element of the group to itself,
has to be included in the [permutations](#permutations) of the rows and the columns.
If the elements are listed in the same order along the vertical and the horizontal axis of the table,
the identity row intersects the identity column on the diagonal from the upper left corner to the lower right corner
because the identity element equals itself when it is combined with itself.
(This property is called [idempotence](#idempotence).)

<details markdown="block">
<summary markdown="span" id="latin-square-associativity-group">
Latin square + associativity = group
</summary>

Being a [Latin square](https://en.wikipedia.org/wiki/Latin_square) is not a
[sufficient condition](https://en.wikipedia.org/wiki/Necessity_and_sufficiency#Sufficiency) to form a group,
which can be demonstrated with the following example:

<figure markdown="block">

<table class="table-with-borders table-with-vertical-border-after-column-1 text-nowrap square-cells">
  <thead>
    <tr>
      <th>∘</th>
      <th>A</th>
      <th>B</th>
      <th>C</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>A</th>
      <td>B</td>
      <td>A</td>
      <td>C</td>
    </tr>
    <tr>
      <th>B</th>
      <td>A</td>
      <td>C</td>
      <td>B</td>
    </tr>
    <tr>
      <th>C</th>
      <td>C</td>
      <td>B</td>
      <td>A</td>
    </tr>
  </tbody>
</table>

<figcaption markdown="span">
This operation does not form a group.
</figcaption>
</figure>

This table lacks an identity row and column,
but more importantly, the operation is not [associative](#group-axioms).
For example, $$(A \circ B) \circ C = A \circ C = C$$,
whereas $$A \circ (B \circ C) = A \circ B = B$$.
Since associativity makes a statement about three elements and not just two,
it is [difficult to spot](https://en.wikipedia.org/wiki/Cayley_table#Associativity)
whether an operation is associative based on its table.
If an operation defined by a Latin square is associative, it does form a group, though.
In order to understand why this is the case, we need to understand
why an associative operation with [unique solutions](#unique-solution)
implies that the identity element is the same for all elements.

Since every column of the operation table is a [permutation](#permutations) of the group's elements,
every element has to appear in its own column.
This means that for every element $$D$$, there exists an element $$E$$ so that $$E \circ D = D$$.
By applying this element [on both sides](#preservation-of-equality) from the left,
we get $$E \circ (E \circ D) = E \circ D$$.
Due to associativity, $$(E \circ E) \circ D = E \circ D$$.
Since $$X \circ D = D$$ has a unique solution, $$E \circ E = E$$.
In other words, every identity for a single element is [idempotent](#idempotence).
What remains to be seen is that an idempotent element is an identity for all elements.

For any element $$F$$, $$E \circ X = F$$ has a unique solution.
Since $$E \circ E = E$$, $$(E \circ E) \circ X = F$$ and thus $$E \circ (E \circ X) = F$$.
Using the fact that $$E \circ X = F$$, it follows that $$F$$ is the unique solution for $$E \circ X = F$$.
This is why an identity for one element is an identity for all elements.
The identity element is unique because $$X \circ F = F$$ would have two solutions otherwise.
The same argument can be used to show that the right identity is also unique.
The left identity $$E_L$$ and the right identity $$E_R$$ are the same
because they are identities for each other: $$E_L = E_L \circ E_R = E_R$$.
Since you can get from any element to any other element in a Latin square,
you can get to the unique identity from any element,
which means that each element has an inverse.

We have shown that any associative operation which generates a Latin square forms a group.
I cover an alternative proof for these alternative group axioms [in the last chapter](#alternative-group-axioms).

</details>

<details markdown="block">
<summary markdown="span" id="fixing-the-group-of-order-3">
Fixing the group of order 3
</summary>

Before we continue, let's fix the [above operation table](#latin-square-associativity-group)
by starting with the necessary identity row and column:

<figure markdown="block">

<table class="table-with-borders table-with-vertical-border-after-column-1 text-nowrap square-cells">
  <thead>
    <tr>
      <th>∘</th>
      <th>A</th>
      <th>B</th>
      <th>C</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>A</th>
      <td>A</td>
      <td>B</td>
      <td>C</td>
    </tr>
    <tr>
      <th>B</th>
      <td>B</td>
      <td>?</td>
      <td>?</td>
    </tr>
    <tr>
      <th>C</th>
      <td>C</td>
      <td>?</td>
      <td>?</td>
    </tr>
  </tbody>
</table>

<figcaption markdown="span">
A skeleton for a group of order 3.
</figcaption>
</figure>

We may try to complete the operation table by setting $$B \circ B$$ to $$A$$,
but this would lead to a conflict in the third row and column:

<figure markdown="block">

<table class="table-with-borders table-with-vertical-border-after-column-1 text-nowrap square-cells">
  <thead>
    <tr>
      <th>∘</th>
      <th>A</th>
      <th>B</th>
      <th>C</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>A</th>
      <td>A</td>
      <td>B</td>
      <td>C</td>
    </tr>
    <tr>
      <th>B</th>
      <td>B</td>
      <td class="background-color-orange">A</td>
      <td class="background-color-red">!</td>
    </tr>
    <tr>
      <th>C</th>
      <td>C</td>
      <td class="background-color-red">!</td>
      <td>?</td>
    </tr>
  </tbody>
</table>

<figcaption markdown="span">
This cannot be completed to a Latin square.
</figcaption>
</figure>

Given that $$C$$ has to occur in the middle row and column and cannot occur a second time in the last row and column,
it has to be that $$B \circ B = C$$.
Another reason for this is that $$B \circ B = A$$ makes the [order](#element-order) of $$B$$ 2
since $$A$$ is the identity element; but this violates [Lagrange's theorem](#lagranges-theorem),
which implies that the order of any element divides the [order of the group](#group-order).
Therefore:

<figure markdown="block">

<table class="table-with-borders table-with-vertical-border-after-column-1 text-nowrap square-cells">
  <thead>
    <tr>
      <th>∘</th>
      <th>A</th>
      <th>B</th>
      <th>C</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>A</th>
      <td>A</td>
      <td>B</td>
      <td>C</td>
    </tr>
    <tr>
      <th>B</th>
      <td>B</td>
      <td>C</td>
      <td>A</td>
    </tr>
    <tr>
      <th>C</th>
      <td>C</td>
      <td>A</td>
      <td>B</td>
    </tr>
  </tbody>
</table>

<figcaption markdown="span">
The only group of order 3.
</figcaption>
</figure>

Since there was no other way to complete the operation table, this is the only group of order 3.
In fact, all groups of prime order are unique up to a relabeling of the elements because
[as we saw earlier](#lagranges-theorem), groups of prime order are [cyclic](#cyclic-groups),
and [as we will see later](#isomorphism-of-cyclic-groups),
all cyclic groups of the same order [behave identically](#group-isomorphisms).
This particular group corresponds to the
[additive group modulo 3](#tool-table-additive-group-operation&modulus=3&coprime=false).

If you enjoy solving [Sudokus](https://en.wikipedia.org/wiki/Sudoku),
you might also enjoy solving the operation table for groups of higher order.
For example, there are
[two solutions for groups of order 4](https://en.wikipedia.org/wiki/List_of_small_groups#List_of_small_abelian_groups).
Can you find them?
And can you [prove that these are the only two groups of order 4](https://proofwiki.org/wiki/Groups_of_Order_4)? 🤓

</details>


### Repetition table {#multiplicative-group-repetition-table}

The following tool repeats the elements of the multiplicative group modulo the given modulus
similar to the [additive groups above](#additive-group-repetition-table):

<div id="tool-table-multiplicative-group-repetition"></div>

As noted [earlier](#multiplicative-groups),
you have to [enable "Coprime"](#tool-table-multiplicative-group-repetition&coprime=true)
to exclude the numbers which don't have an inverse and therefore don't belong to the group
if the modulus isn't [prime](#prime-factorization).
Multiplicative groups are different from [additive groups](#additive-groups) in several regards:
- **Non-cyclic groups**: Not all multiplicative groups are [cyclic](#cyclic-groups).
  For example, the multiplicative groups modulo
  [8](#tool-table-multiplicative-group-repetition&modulus=8&coprime=true&repeat=false),
  [12](#tool-table-multiplicative-group-repetition&modulus=12&coprime=true&repeat=false),
  and [15](#tool-table-multiplicative-group-repetition&modulus=15&coprime=true&repeat=false)
  have no [generator](#group-generators).
  As we'll discuss [later](#carmichaels-totient-function),
  all multiplicative groups modulo a prime number are cyclic, though.
- **Square root of one**: If a multiplicative group is cyclic and the modulus $$m$$ is greater than two,
  then $$m - 1$$ is the only element with an [order](#element-order) of two.
  ($$m - 1$$ is [congruent](#congruence-relation) to $$-1$$, and $$(-1)^2 = 1$$.)
  The element $$m - 1$$ is marked with a gray background.
  Whenever the order of an element in a cyclic group is even,
  you encounter $$m - 1$$ at half its order.
  No other element can have an order of two as the group wouldn't be cyclic otherwise.
  As mentioned in the previous point, not all multiplicative groups are cyclic.
  When calculating [modulo 24](#tool-table-multiplicative-group-repetition&modulus=24&coprime=true&repeat=false),
  for example, all elements except the identity element have an order of two and are thus their own inverse.
- **Subgroups of prime order**: You cannot construct a group with a prime order greater than two with the above tool
  because the [number of coprime elements](#eulers-totient-function) below any modulus is always even.
  When a prime order is desirable for cryptographic applications, you have to resort to [subgroups](#subgroups).
  For example, many elements generate a subgroup of order 11
  when you [set the modulus to 23](#tool-table-multiplicative-group-repetition&modulus=23&coprime=true&repeat=false).
- **Symmetry of even columns**: Since $$(-A)^e = A^e$$ whenever the exponent $$e$$ is even,
  even columns are [palindromes](https://en.wikipedia.org/wiki/Palindrome) (i.e. $$\downarrow\ =\ \uparrow$$).

<details markdown="block">
<summary markdown="span" id="all-subgroups-of-cyclic-groups-are-cyclic">
All subgroups of cyclic groups are cyclic
</summary>

Given a [generator](#group-generators) $$G$$ which generates
the [cyclic group](#cyclic-groups) $$\mathbb{G} = \href{#group-generators}{⟨G⟩}$$
of [order](#group-order) $$n = \lvert \mathbb{G} \rvert = \lvert G \rvert$$,
there exists a single [subgroup](#subgroups) of order $$d$$ for every [divisor](#divisor) $$d$$ of $$n$$.
We [prove this statement](https://crypto.stanford.edu/pbc/notes/numbertheory/cyclic.html#_subgroups_of_cyclic_groups)
by showing that such a subgroup exists and that it is unique:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

- **Existence**: Let $$c = n / d$$, then $$⟨cG⟩ = \{cG, 2(cG), …, d(cG) = O\}$$ is a cyclic subgroup of order $$d$$.
- **Uniqueness**: Given a subgroup $$\mathbb{H} = \{A_1, …, A_d\}$$ of order $$d$$,
  we show that there is an integer $$b$$ for each $$A \in \mathbb{H}$$ so that $$A = b(cG)$$,
  which implies that $$\mathbb{H} = ⟨cG⟩$$.
  Since $$G$$ generates all elements of $$\mathbb{G}$$, there exists an integer $$a$$ so that $$A = aG$$.
  Since a subgroup is a group, the order of $$A$$ must divide $$d$$ according to [Lagrange's theorem](#lagranges-theorem).
  Therefore, $$dA = d(aG) = O$$.
  Since the order of $$G$$ is $$n$$, $$a \cdot d$$ must be a multiple of $$n$$,
  which means that there exists an integer $$b$$ so that $$a \cdot d = b \cdot n = b \cdot (c \cdot d)$$.
  It follows that $$a = b \cdot c$$ and $$A = aG = b(cG)$$.

<!-- -->

- **Existence**: Let $$c = n / d$$, then $$⟨G^c⟩ = \{G^c, (G^c)^2, …, (G^c)^d = I\}$$ is a cyclic subgroup of order $$d$$.
- **Uniqueness**: Given a subgroup $$\mathbb{H} = \{A_1, …, A_d\}$$ of order $$d$$,
  we show that there is an integer $$b$$ for each $$A \in \mathbb{H}$$ so that $$A = (G^c)^b$$,
  which implies that $$\mathbb{H} = ⟨G^c⟩$$.
  Since $$G$$ generates all elements of $$\mathbb{G}$$, there exists an integer $$a$$ so that $$A = G^a$$.
  Since a subgroup is a group, the order of $$A$$ must divide $$d$$ according to [Lagrange's theorem](#lagranges-theorem).
  Therefore, $$A^d = (G^a)^d = I$$.
  Since the order of $$G$$ is $$n$$, $$a \cdot d$$ must be a multiple of $$n$$,
  which means that there exists an integer $$b$$ so that $$a \cdot d = b \cdot n = b \cdot (c \cdot d)$$.
  It follows that $$a = b \cdot c$$ and $$A = G^a = (G^c)^b$$.

</div>

[For example](#tool-table-multiplicative-group-repetition&modulus=13&repeat=false&order=false&totient=false),
<!-- --> $$2$$ generates the multiplicative group modulo $$13$$ of order $$12$$.
A subgroup of order $$6$$ is generated by $$2^{12/6} =_{13} 4$$.
Another subgroup of order $$6$$ may contain $$9 =_{13} 2^8$$.
In this case, $$b = \frac{a \cdot d}{n} = \frac{8 \cdot 6}{12} = 4$$.
It follows that $$4^4 =_{13} 9$$, which is true.

To get a better feeling for where an element with a certain order may or may not appear,
you can [enable the "Order" option](#tool-table-multiplicative-group-repetition&order=true).

</details>


### Subgroup cosets {#multiplicative-group-subgroup-cosets}

The following tool shows the [cosets](#subgroup-cosets) of the [subgroup](#subgroups) generated by the given element
(see the [additive groups](#additive-group-subgroup-cosets) for explanations):

<div id="tool-cosets-multiplicative-group"></div>

<details markdown="block">
<summary markdown="span" id="non-cyclic-subgroups-of-non-cyclic-groups">
Non-cyclic subgroups of non-cyclic groups
</summary>

[Subgroups](#subgroups) don't have to be generated by a single element.
[For example](#tool-table-multiplicative-group-repetition&modulus=15&coprime=true&repeat=false&order=false&totient=false),
<!-- --> $$\{1, 4, 11, 14\}$$ form a multiplicative group modulo $$15$$:

$$
\begin{aligned}
4 \cdot 4 &=_{15} 1 \\
4 \cdot 11 &=_{15} 14 \\
4 \cdot 14 &=_{15} 11 \\
11 \cdot 11 &=_{15} 1 \\
11 \cdot 14 &=_{15} 4 \\
14 \cdot 14 &=_{15} 1
\end{aligned}
$$

Since each element is its own inverse, none of the elements generates the whole subgroup.
Its [cosets](#subgroup-cosets) still partition the [non-cyclic](#cyclic-groups)
multiplicative group of coprime elements modulo 15:

<figure markdown="block">

<table class="table-with-borders table-with-vertical-border-after-column-1 text-nowrap square-cells">
  <thead>
    <tr>
      <th>1</th>
      <th>4</th>
      <th>11</th>
      <th>14</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>2</th>
      <td>8</td>
      <td>7</td>
      <td>13</td>
    </tr>
  </tbody>
</table>

<figcaption markdown="span">
The unique cosets of {1, 4, 11, 14} modulo 15.
</figcaption>
</figure>

The [above tool](#tool-table-multiplicative-group-repetition) just doesn't support this case
because we're usually interested only in [repetitions of a single element](#element-repetitions).

</details>


### Group notations {#multiplicative-group-notations}

The multiplicative group of integers modulo some number $$m$$ is usually
[denoted as](https://en.wikipedia.org/wiki/Multiplicative_group_of_integers_modulo_n#Notation)
<!-- --> $$(\mathbb{Z}/m\mathbb{Z})^\times$$ or $$\mathbb{Z}_m^\times$$.
As mentioned [previously](#additive-group-notations),
the former notation is derived from the [quotient ring](#quotient-rings) $$\mathbb{Z}/m\mathbb{Z}$$.
Both notations imply that the integers below the modulus are restricted
[to those which have an inverse](#multiplicative-group-of-units).
Cryptographers often use the latter notation with an [asterisk](https://en.wikipedia.org/wiki/Asterisk)
as the multiplication sign, i.e. $$\mathbb{Z}_m^*$$.


### Fermat's little theorem

[Fermat's little theorem](https://en.wikipedia.org/wiki/Fermat%27s_little_theorem) states that
for any integers $$a$$ and $$p$$,
if $$p$$ is [prime](#prime-factorization) and $$a$$ is not a multiple of $$p$$, then $$a^{p - 1} =_p 1$$.
This theorem is an instantiation of the [second consequence](#lagrange-consequences)
of [Lagrange's theorem](#lagranges-theorem),
which states that if you repeat an element of a group as many times as there are elements in the group,
you get the [identity element](#group-axioms) of the group.
The theorem is named after [Pierre de Fermat](https://en.wikipedia.org/wiki/Pierre_de_Fermat) (1607 − 1665).
There is no Fermat's big theorem,
but [several theorems](https://en.wikipedia.org/wiki/Fermat%27s_theorem) are named after him.
We will generalize Fermat's little theorem to non-prime integers in the [next chapter](#eulers-theorem).


### Modular multiplicative inverse

As discussed [earlier](#inverse-through-repetitions),
you can compute the inverse of an element by repeating it one time less than its [order](#element-order).
Using [Fermat's little theorem](#fermats-little-theorem),
we can compute the [multiplicative inverse](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse)
modulo a [prime number](#prime-factorization) $$p$$ for any element $$A$$ as $$A^{-1} =_p A^{p-2}$$
because $$A \cdot A^{p-2} =_p A^{p-1} =_p 1$$.
As we'll see in the [next chapter](#extended-euclidean-algorithm),
there's a faster way to compute the multiplicative inverse of an element.
In cryptography, speed is not the only consideration, though;
you also want to avoid [side-channel attacks](https://en.wikipedia.org/wiki/Side-channel_attack).
If you want to compute the multiplicative inverse of an element
in [constant time](https://en.wikipedia.org/wiki/Timing_attack#Avoidance),
you might still prefer to compute $$A^{-1}$$ as $$A^{p-2}$$.


### Discrete-logarithm problem (DLP) {#discrete-logarithm-problem}
{:data-toc-text="Discrete-logarithm problem"}

A lot of modern cryptography is built on the [assumption](https://en.wikipedia.org/wiki/Computational_hardness_assumption)
that computing the [discrete logarithm](https://en.wikipedia.org/wiki/Discrete_logarithm) in multiplicative groups
is infeasible on classical computers if you choose the modulus $$m$$ [carefully](#pohlig-hellman-algorithm).
In other words, while computing $$K =_m G^k$$ given a [generator](#group-generators) $$G$$ and an exponent $$k$$ is easy
(we [have seen](#fast-repetitions) that the [running time](https://en.wikipedia.org/wiki/Time_complexity)
is proportional to the number of bits in $$k$$),
computing $$k = \log_G(K)$$ as the [logarithm](https://en.wikipedia.org/wiki/Logarithm)
of $$K$$ to the [base](https://en.wikipedia.org/wiki/Base_(exponentiation)) $$G$$ is presumably hard.
If this assumption is indeed true, [modular exponentiation](https://en.wikipedia.org/wiki/Modular_exponentiation)
is a [linear one-way function](#linear-one-way-functions).
As mentioned [earlier](#computational-complexity-theory), it is widely believed that this is the case,
but we still lack a proof for the [hardness](https://en.wikipedia.org/wiki/Computational_hardness_assumption)
of the discrete-logarithm [problem](https://en.wikipedia.org/wiki/Computational_problem).
We'll study the best known [algorithms](https://en.wikipedia.org/wiki/Algorithm)
for solving the discrete-logarithm problem in the [second to last chapter](#dl-algorithms).

<details markdown="block">
<summary markdown="span" id="quantum-computers">
Quantum computers
</summary>

[Quantum computers](https://en.wikipedia.org/wiki/Quantum_computing) perform calculations
using the physical properties of [quantum mechanics](https://en.wikipedia.org/wiki/Quantum_mechanics),
such as [superposition](https://en.wikipedia.org/wiki/Quantum_superposition).
The discrete-logarithm problem can be solved efficiently on a sufficiently powerful quantum computer
with [Shor's algorithm](https://en.wikipedia.org/wiki/Shor%27s_algorithm),
named after [Peter Shor](https://en.wikipedia.org/wiki/Peter_Shor) (born in 1959).
The quantum computers which have been built until now are by far not powerful enough to break modern cryptography,
but since this might change in the future, cryptography which cannot be broken by quantum computers
– so-called [post-quantum cryptography](https://en.wikipedia.org/wiki/Post-quantum_cryptography) –
is an active area of research with increasing interest.

</details>


## Prime numbers

We've talked quite a bit about [prime numbers](https://en.wikipedia.org/wiki/Prime_number) already.
The goal of this chapter is to give you a better understanding about primality
and related concepts such as [factorization](#prime-factorization).
From here to the end of this article, the topics get more and more advanced.
None of the remaining topics are required to get a basic understanding of modern cryptosystems.
This chapter fills some gaps from previous chapters,
such as why only [coprime integers](#multiset-of-prime-factors)
have a [multiplicative inverse](#multiplicative-inverse-revisited),
generalizes some results,
such as [Fermat's little theorem](#fermats-little-theorem) to [Euler's theorem](#eulers-theorem),
and discusses some algorithmic aspects,
such as how to [compute the multiplicative inverse](#extended-euclidean-algorithm)
and how to [test whether an integer is prime](#probabilistic-primality-tests).
The chapters afterwards build towards [elliptic curves](#elliptic-curves),
which are another popular way to construct a [linear one-way function](#linear-one-way-functions).

<details markdown="block">
<summary markdown="span" id="formatting-preferences">
Formatting preferences
</summary>

All tools in this chapter can handle arbitrarily large integers, which are easier to read
when their digits are [grouped with a delimiter](https://en.wikipedia.org/wiki/Decimal_separator#Digit_grouping).
I prefer the [apostrophe](https://en.wikipedia.org/wiki/Apostrophe) as a thousand separator,
but [other people have different preferences](https://github.com/KasparEtter/ef1p/issues/3).
From time to time, you may also want to copy numbers
or [expressions](https://en.wikipedia.org/wiki/Expression_(mathematics))
to other calculators or to [source code](https://en.wikipedia.org/wiki/Source_code),
in which case it is best if the number or expression isn't formatted at all.
(Many [programming languages](https://en.wikipedia.org/wiki/Programming_language)
actually allow [underscores](https://en.wikipedia.org/wiki/Underscore)
in [integer literals](https://en.wikipedia.org/wiki/Integer_literal).)
For these reasons, I decided to make the outputs of my tools fully configurable,
including the signs of various operations:

<div id="tool-math-formatting"></div>

</details>


### Prime factorization

Every positive integer is a [multiple](https://en.wikipedia.org/wiki/Multiple_(mathematics)) of 1 and itself.
Many positive integers are also a multiple of other positive integers,
which means that they can be divided by an integer between 1 and themselves without a [remainder](#euclidean-division).
Such integers can therefore be written as a [product](https://en.wikipedia.org/wiki/Product_(mathematics))
of two [factors](https://en.wikipedia.org/wiki/Divisor), which are both smaller than their product.
Positive integers which can be split into a product of two smaller positive integers
are called [composite](https://en.wikipedia.org/wiki/Composite_number).
All other positive integers [except 1](#the-integer-1) are called [prime](https://en.wikipedia.org/wiki/Prime_number).
The process of splitting a composite number into a product of smaller integers
is called [integer factorization](https://en.wikipedia.org/wiki/Integer_factorization).
As long as one of the factors is still composite, you can continue the factorization until all factors are prime.
Since the factors are smaller than the integer which is factorized but cannot get smaller than 2,
the factorization into primes terminates after a finite number of steps for every integer.
To find the factors of an integer, you can simply try all possible factors until
the [square root](https://en.wikipedia.org/wiki/Square_root) of the given integer.
This [algorithm](https://en.wikipedia.org/wiki/Algorithm) is called
[trial division](https://en.wikipedia.org/wiki/Trial_division) and
[proves constructively](https://en.wikipedia.org/wiki/Constructive_proof)
that every positive integer can be written as a product of primes.
We'll prove [later](#unique-factorization-theorem)
that the factorization into primes is unique (up to the order of the primes).
Unfortunately, the number of integers between 2 and the square root of the given integer
scales exponentially in the number of bits, and hence trial division isn't very useful in practice.
There are [faster factoring algorithms](https://en.wikipedia.org/wiki/Integer_factorization#Factoring_algorithms)
(we'll study [one of them](#pollards-rho-factorization-algorithm) in the second to last chapter),
but similar to the [discrete-logarithm problem](#discrete-logarithm-problem),
no algorithm is known for factoring (large) integers efficiently on [classical computers](#quantum-computers).
The following tool factorizes integers into primes using trial division with the configured delay between attempts.

<div id="tool-integer-factorization-trial-division"></div>

<details markdown="block">
<summary markdown="span" id="the-integer-1">
The integer 1
</summary>

[By convention](https://en.wikipedia.org/wiki/Prime_number#Primality_of_one),
1 is not included in the set of prime numbers in order to make statements involving prime numbers simpler.

</details>

<details markdown="block">
<summary markdown="span" id="euclids-theorem">
Euclid's theorem
</summary>

[Euclid's theorem](https://en.wikipedia.org/wiki/Euclid%27s_theorem) states that there are infinitely many prime numbers.
It is named after [Euclid](https://en.wikipedia.org/wiki/Euclid),
who proved it around 300 [BCE](https://en.wikipedia.org/wiki/Common_Era).
If there were only a finite number of primes,
then the product of all primes plus 1 cannot be divided without remainder by any of the prime numbers.
The new number is therefore either prime or has prime factors which were not accounted for.
Since this is a [contradiction](https://en.wikipedia.org/wiki/Proof_by_contradiction),
there has to be an infinite number of primes.

</details>

<details markdown="block">
<summary markdown="span" id="smooth-numbers">
Smooth numbers
</summary>

An integer is called [$$n$$-smooth](https://en.wikipedia.org/wiki/Smooth_number)
if none of its prime factors are greater than $$n$$.
As you can see when playing with the [above tool](#tool-integer-factorization-trial-division),
factoring large numbers is [easy](#computational-complexity-theory) if most of their factors are sufficiently small.
Since this is often [undesirable](#pohlig-hellman-algorithm) in cryptographic applications,
you have to choose the delicate parameters [carefully](#sophie-germain-and-safe-primes).

</details>


### Multiset of prime factors

Since each number can be written as a [product of prime factors](#prime-factorization),
we can represent each number by the [multiset](https://en.wikipedia.org/wiki/Multiset) of its prime factors.
Unlike a [set](https://en.wikipedia.org/wiki/Set_(mathematics)), a multiset can contain an element multiple times.
The number of times that an element is included in a multiset is called the multiplicity of the element in the multiset.
We can extend the following [operations](https://en.wikipedia.org/wiki/Binary_operation)
and [relations](https://en.wikipedia.org/wiki/Binary_relation) from [set theory](https://en.wikipedia.org/wiki/Set_theory)
[to multisets](https://en.wikipedia.org/wiki/Multiset#Basic_properties_and_operations):
- [**Union**](https://en.wikipedia.org/wiki/Union_(set_theory)):
  The union $$\mathbb{C}$$ of the multisets $$\mathbb{A}$$ and $$\mathbb{B}$$
  contains each element contained in $$\mathbb{A}$$ or $$\mathbb{B}$$ with the higher of the two multiplicities.
  Using the notation from sets, we write this as $$\mathbb{C} = \mathbb{A} \cup \mathbb{B}$$.
  For example, $$\{2, 2, 3\} \cup \{2, 5\} = \{2, 2, 3, 5\}$$.
- [**Intersection**](https://en.wikipedia.org/wiki/Intersection_(set_theory)):
  The intersection $$\mathbb{C}$$ of the multisets $$\mathbb{A}$$ and $$\mathbb{B}$$
  contains each element contained in both $$\mathbb{A}$$ and $$\mathbb{B}$$ with the lower of the two multiplicities.
  Using the notation from sets, we write this as $$\mathbb{C} = \mathbb{A} \cap \mathbb{B}$$.
  For example, $$\{2, 2, 3\} \cap \{2, 5\} = \{2\}$$.
- [**Inclusion**](https://en.wikipedia.org/wiki/Inclusion_(set_theory)):
  The multiset $$\mathbb{B}$$ includes the multiset $$\mathbb{A}$$
  if every element contained in $$\mathbb{A}$$ is also contained in $$\mathbb{B}$$ with the same or a higher multiplicity.
  We write this as $$\mathbb{A} \subseteq \mathbb{B}$$ or, if at least one element has a higher multiplicity
  in $$\mathbb{B}$$ than in $$\mathbb{A}$$, as $$\mathbb{A} \subset \mathbb{B}$$.
  For example, $$\{2, 2\} \subset \{2, 2, 3\}$$.

Unlike [tuples](https://en.wikipedia.org/wiki/Tuple) and [lists](https://en.wikipedia.org/wiki/List_(abstract_data_type)),
the order of the elements in multisets matters neither for comparison nor the above operations.
We say that an integer $$a$$ is [coprime](https://en.wikipedia.org/wiki/Coprime_integers) with an integer $$b$$
(or, equivalently, that $$a$$ is relatively prime to $$b$$) if $$a$$ and $$b$$ have no prime factor in common.
Using the name of an integer in [blackboard bold](https://en.wikipedia.org/wiki/Blackboard_bold)
to denote the multiset of its prime factors, we can write this as $$\mathbb{A} \cap \mathbb{B} = \varnothing$$,
where $$\varnothing$$ denotes the [empty multiset](https://en.wikipedia.org/wiki/Empty_set).
Coprimality can be visualized with a [Venn diagram](https://en.wikipedia.org/wiki/Venn_diagram),
named after [John Venn](https://en.wikipedia.org/wiki/John_Venn) (1834 − 1923), like this:

<figure markdown="block">
{% include_relative generated/set-disjoint.embedded.svg %}
<figcaption markdown="span">

The prime factors of two coprime integers are [disjoint](https://en.wikipedia.org/wiki/Disjoint_sets).

</figcaption>
</figure>


### Greatest common divisor (GCD) {#greatest-common-divisor}
{:data-toc-text="Greatest common divisor"}

The [greatest common divisor](https://en.wikipedia.org/wiki/Greatest_common_divisor) of two integers
is the largest positive integer which divides both integers [without a remainder](#euclidean-division).
Since the [factorization into primes](#prime-factorization) is unique,
as we will prove [soon](#unique-factorization-theorem),
the prime factors of any [divisor](#divisor) of an integer $$a$$
are [included in the prime factors](#multiset-of-prime-factors) of $$a$$.
(If this wasn't the case, the factorization of $$a$$ wouldn't be unique.)
The greatest common divisor of any two integers thus corresponds to the intersection of their prime factors
because any larger integer no longer divides both integers:

<figure markdown="block">
{% include_relative generated/set-intersection.embedded.svg %}
<figcaption markdown="span">
GCD = intersection of prime factors
</figcaption>
</figure>

We write the greatest common divisor of the integers $$a$$ and $$b$$ as $$\operatorname{gcd}(a, b)$$.
Any integer which divides both $$a$$ and $$b$$ also divides $$\operatorname{gcd}(a, b)$$.
The only and thus the greatest common divisor of two [coprime integers](#multiset-of-prime-factors) is 1.
As we will see [in a moment](#euclidean-algorithm),
the greatest common divisor of two integers can be computed efficiently
without having to determine the prime factors of both integers first.


### Least common multiple (LCM) {#least-common-multiple}
{:data-toc-text="Least common multiple"}

The [least common multiple](https://en.wikipedia.org/wiki/Least_common_multiple) of two positive integers
is the smallest positive integer which is a multiple of both integers.
The product of all the numbers in the [union of the prime factors](#multiset-of-prime-factors) of both integers
is the smallest number which is a multiple of both integers:

<figure markdown="block">
{% include_relative generated/set-union.embedded.svg %}
<figcaption markdown="span">
LCM = union of prime factors
</figcaption>
</figure>

We write the least common multiple of the integers $$a$$ and $$b$$ as $$\operatorname{lcm}(a, b)$$.
Since the product of $$a$$ and $$b$$ contains the prime factors in the intersection twice,
you get the least common multiple when you divide the product
by the [greatest common divisor](#greatest-common-divisor) of $$a$$ and $$b$$:

$$
\operatorname{lcm}(a, b) = \frac{a \cdot b}{\operatorname{gcd}(a, b)}
$$

If $$a$$ and $$b$$ are coprime, then $$\operatorname{gcd}(a, b) = 1$$ and $$\operatorname{lcm}(a, b) = a \cdot b$$.
(Unlike [Wikipedia](https://en.wikipedia.org/wiki/Least_common_multiple#Using_the_greatest_common_divisor),
we don't care about negative inputs here.)


### Euclidean algorithm

The [greatest common divisor](#greatest-common-divisor) can also be interpreted geometrically:
Given a rectangle, what is the largest square which tiles the rectangle in both dimensions without remainders?
If you want to tile a rectangular bathroom which is 51 units wide and 21 units deep, for example,
which square tiles should you order so that you don't have to break any tiles and have as little work as possible?
In order to find the answer, we can make the problem smaller and smaller.
Any square which divides some length in one dimension also divides the same length in the other dimension.
This means that we can subtract the smaller side from the larger side without affecting the solution.
Given that our room is 21 units deep, we know that there has to be a boundary between tiles 21 units in from the left.
This reduces the problem to a rectangle which is 30 units wide and 21 units deep.
We can repeat this procedure of splitting off squares from our rectangle until we're left with a square.
The side of this square corresponds to the greatest common divisor of the two numbers that we started with.
In our example, a square whose sides are 3 units is the largest square which tiles the room:

<figure markdown="block">
{% include_relative generated/euclidean-algorithm.embedded.svg %}
<figcaption markdown="span">
From the pink room, we split off the red squares and the orange squares to get the yellow squares.
</figcaption>
</figure>

This procedure for determining the greatest common divisor of two numbers is called
the [Euclidean algorithm](https://en.wikipedia.org/wiki/Euclidean_algorithm).
It is named after the Greek mathematician [Euclid](https://en.wikipedia.org/wiki/Euclid),
who described it around 300 [BCE](https://en.wikipedia.org/wiki/Common_Era).
A [recursive implementation](https://en.wikipedia.org/wiki/Recursion_(computer_science)) of the algorithm looks as follows:

$$
\operatorname{gcd}(a, b) = \begin{cases}
a &\text{if } a = b\text{,} \\
\operatorname{gcd}(a - b, b) &\text{if } a > b \text{,} \\
\operatorname{gcd}(a, b - a) &\text{if } a < b \text{.}
\end{cases}
$$

The algorithm is guaranteed to terminate because one of the two parameters gets smaller in every iteration
and the parameters never get smaller than 1 since 1 divides all integers.
Instead of subtracting the smaller number from the larger number one by one,
we can use the [modulo operation](#modulo-operation) to subtract the smaller number from the larger number
as many times as it takes to make the larger number smaller than the smaller number in one go.
The Euclidean algorithm is typically implemented as follows:

```javascript
function gcd(a, b) {
    while (b != 0) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}
```

Since this is valid [JavaScript](https://en.wikipedia.org/wiki/JavaScript),
you can copy the code to the [developer tools](https://en.wikipedia.org/wiki/Web_development_tools) of your browser
and verify that `gcd(51, 21)` is indeed `3`.
`t` is just a [temporary variable](https://en.wikipedia.org/wiki/Temporary_variable) to swap the values of `a` and `b`.
If `b` is greater than `a` initially, the first round results only in
the [swapping](https://en.wikipedia.org/wiki/Swap_(computer_programming)) of `a` and `b`.
Unlike [integer factorization](#prime-factorization),
the Euclidean algorithm is [efficient](https://en.wikipedia.org/wiki/Euclidean_algorithm#Algorithmic_efficiency)
and can thus be computed even for very large integers.


### Extended Euclidean algorithm

When calculating the [greatest common divisor](#greatest-common-divisor)
of any positive integers $$a$$ and $$b$$ with the [Euclidean algorithm](#euclidean-algorithm),
we can keep track of how we combined these two numbers to get the current intermediate value.
Instead of subtracting numbers from one another, we subtract equations from one another
so that we end up with [coefficients](https://en.wikipedia.org/wiki/Coefficient) for $$a$$ and $$b$$
which result in the greatest common divisor:

$$
\begin{aligned}
a &= 1 \cdot a + 0 \cdot b \\
b &= 0 \cdot a + 1 \cdot b \\
&\enspace \vdots \\
\operatorname{gcd}(a, b) &= c \cdot a + d \cdot b
\end{aligned}
$$

This procedure is known as the [extended Euclidean algorithm](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm),
and the equation we end up with is known as [Bézout's identity](#bezouts-identity).
The following tool visualizes the extended Euclidean algorithm with a table.
The first two rows after the column titles contain the initialization of the algorithm
as in the equations above this paragraph, where the larger number is taken first.
The "remainder" column contains the values of the [Euclidean algorithm](#euclidean-algorithm);
the two columns after that contain the coefficients of the larger and the smaller input.
The "quotient" column indicates how many times the current row is subtracted from the row above.
The cell with the green background contains the last value before we reach 0,
which is the greatest common divisor of the two inputs to the tool.

<div id="tool-integer-extended-euclidean-algorithm"></div>


### Bézout's identity {#bezouts-identity}

[Bézout's identity](https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity),
named after [Étienne Bézout](https://en.wikipedia.org/wiki/%C3%89tienne_B%C3%A9zout) (1730 − 1783),
makes the following two statements:
- **Existence**: For any two positive integers $$a$$ and $$b$$, there exist some integers $$c$$ and $$d$$
  so that $$\operatorname{\href{#greatest-common-divisor}{gcd}}(a, b) = c \cdot a + d \cdot b$$.
  The [extended Euclidean algorithm](#extended-euclidean-algorithm)
  [proves constructively](https://en.wikipedia.org/wiki/Constructive_proof)
  that such [coefficients](https://en.wikipedia.org/wiki/Coefficient) $$c$$ and $$d$$ exist.
  These coefficients are not unique, though.
  Since the coefficients in the last row of the [tool above](#tool-integer-extended-euclidean-algorithm)
  add up to $$0$$ when multiplied by the corresponding input,
  you can add multiples of the last row to the second to last row without affecting the left side of the equation.
  [For example](#tool-integer-extended-euclidean-algorithm&a=51&b=21),
  as $$3 = (-2) \cdot 51 + 5 \cdot 21$$ and $$0 = 7 \cdot 51 + (-17) \cdot 21$$,
  we also have that $$3 = (-2 + 7) \cdot 51 + (5 - 17) \cdot 21 = 5 \cdot 51 + (-12) \cdot 21$$.
- **Multiples**: Every [linear combination](https://en.wikipedia.org/wiki/Linear_combination)
  of $$a$$ and $$b$$ is a multiple of $$\operatorname{gcd}(a, b)$$,
  and every multiple of $$\operatorname{gcd}(a, b)$$ can be expressed as a linear combination of $$a$$ and $$b$$.
  Denoting $$\operatorname{gcd}(a, b)$$ as $$g$$,
  we can write this as $$\{e \cdot a + f \cdot b \mid e, f \in \mathbb{Z}\} = \{h \cdot g \mid h \in \mathbb{Z}\}$$.
  The second half of this statement is an immediate consequence of the previous point:
  Since $$g = c \cdot a + d \cdot b$$ for some integers $$c$$ and $$d$$,
  any multiple $$h \cdot g = (h \cdot c) \cdot a + (h \cdot d) \cdot b$$
  due to [distributivity](https://en.wikipedia.org/wiki/Distributive_property),
  which is a linear combination of $$a$$ and $$b$$.
  We prove the first half of the statement
  with the following two [lemmas](https://en.wikipedia.org/wiki/Lemma_(mathematics)):
  - Let $$\mathbb{I} = \{e \cdot a + f \cdot b \mid e, f \in \mathbb{Z}\}$$
    and $$i$$ be the smallest positive element in $$\mathbb{I}$$.
    Claim: All elements in $$\mathbb{I}$$ are a multiple of $$i$$.
    Proof: Using [Euclidean division](#euclidean-division),
    every element $$j$$ in $$\mathbb{I}$$ can be written as $$j = q \cdot i + r$$
    for some integers $$q$$ and $$r$$ with $$0 ≤ r < i$$.
    Since $$i$$ and $$j$$ are in $$\mathbb{I}$$,
    which means that $$i = i_a \cdot a + i_b \cdot b$$ and $$j = j_a \cdot a + j_b \cdot b$$
    for some $$i_a, i_b, j_a, j_b \in \mathbb{Z}$$,
    so is $$r = j - q \cdot i = (j_a \cdot a + j_b \cdot b) - q \cdot (i_a \cdot a + i_b \cdot b)
    = (j_a - q \cdot i_a) \cdot a + (j_b - q \cdot i_b) \cdot b \in \mathbb{I}$$.
    Since $$0 ≤ r < i$$ and $$i$$ is by assumption the smallest positive element in $$\mathbb{I}$$,
    <span class="text-nowrap" markdown="span">$$r$$ must</span> be $$0$$.
    Therefore, every $$j \in \mathbb{I}$$ is indeed a multiple of $$i$$.
    (As we will see [later](#ideals), $$\mathbb{I}$$ is
    a so-called [ideal](https://en.wikipedia.org/wiki/Ideal_(ring_theory)).)
  - Claim: The smallest positive element $$i \in \mathbb{I}$$ is the greatest common divisor of $$a$$ and $$b$$.
    Proof: Since all linear combinations of $$a$$ and $$b$$ are multiples of $$i$$ according to the first lemma,
    both $$a$$ and $$b$$ are multiples of $$i$$, which means that $$i$$ is a common divisor of both $$a$$ and $$b$$.
    Any integer which divides both $$a$$ and $$b$$ also divides every integer
    of the form $$e \cdot a + f \cdot b$$ due to distributivity.
    Since $$i$$ is of this form, all common divisors divide $$i$$.
    Therefore, $$i$$ is the greatest common divisor of $$a$$ and $$b$$.

The second part of Bézout's identity matches our [earlier observation](#visualization-of-cosets)
that all modular multiples of a number are spaced equally.
You can also think of the [greatest common divisor](#greatest-common-divisor) of $$a$$ and $$b$$
as the biggest [unit](https://en.wikipedia.org/wiki/Unit_of_measurement)
in which $$a$$ and $$b$$ can be expressed without [fractions](https://en.wikipedia.org/wiki/Fraction).
Just as you can't get fractions when adding and subtracting integers,
you can't get fractions of this unit when you add and subtract only multiples of it.
I use [distance](https://en.wikipedia.org/wiki/Distance) to visualize $$a$$ and $$b$$,
but you can apply this idea to any [quantity](https://en.wikipedia.org/wiki/Quantity),
including [mass](https://en.wikipedia.org/wiki/Mass),
[volume](https://en.wikipedia.org/wiki/Volume),
and [time](https://en.wikipedia.org/wiki/Time).

<figure markdown="block">
{% include_relative generated/bezouts-identity-1.embedded.svg %}
<figcaption markdown="span">
You cannot get an odd number when adding and subtracting two even numbers.
</figcaption>
</figure>

The first part of Bézout's identity means that we can measure this unit
when given only prototypes for the quantities $$a$$ and $$b$$:

<figure markdown="block">
{% include_relative generated/bezouts-identity-2.embedded.svg %}
<figcaption markdown="span">

The [extended Euclidean algorithm](#extended-euclidean-algorithm) tells us that
[gcd(10, 6) = 2 = 2 · 6 − 1 · 10](#tool-integer-extended-euclidean-algorithm&a=10&b=6).

</figcaption>
</figure>


### Euclid's lemma

[Euclid's lemma](https://en.wikipedia.org/wiki/Euclid%27s_lemma) states that
if a prime $$p$$ divides the product $$a \cdot b$$ of some integers $$a$$ and $$b$$,
then $$p$$ divides $$a$$ or $$b$$ ([or both](https://en.wikipedia.org/wiki/Logical_disjunction)).
Clearly, if $$p$$ divides $$a$$, the statement is true.
So all we need to show is that if $$p$$ does not divide $$a$$, then $$p$$ divides $$b$$.
Since $$p$$ is prime and $$a$$ is not a multiple of $$p$$, $$p$$ and $$a$$ are [coprime](#multiset-of-prime-factors).
Using [Bézout's identity](#bezouts-identity),
we know that there are some integers $$c$$ and $$d$$ so that $$c \cdot p + d \cdot a = 1$$.
When we multiply this equation by $$b$$, we get $$c \cdot p \cdot b + d \cdot a \cdot b = b$$.
Since the previous statement is an [implication](https://en.wikipedia.org/wiki/Material_conditional), we can assume
the so-called [antecedent](https://en.wikipedia.org/wiki/Antecedent_(logic)) (that $$p$$ divides $$a \cdot b$$)
when proving the so-called [consequent](https://en.wikipedia.org/wiki/Consequent) (that $$p$$ divides $$b$$).
Therefore, $$b$$ is a multiple of $$p$$ because both $$c \cdot p \cdot b$$
and $$d \cdot a \cdot b$$ are multiples of $$p$$.
(If you add multiples of a number, you get another multiple
due to [distributivity](https://en.wikipedia.org/wiki/Distributive_property):
<!-- --> $$e \cdot p + f \cdot p = (e + f) \cdot p$$ for any $$e$$ and $$f$$.)

<details markdown="block">
<summary markdown="span" id="unique-factorization-theorem">
Unique factorization theorem
</summary>

The unique factorization theorem, which is also known as the
[fundamental theorem of arithmetic](https://en.wikipedia.org/wiki/Fundamental_theorem_of_arithmetic),
states that every integer greater than 1 can be written uniquely
– up to the order of the factors – as a product of prime numbers.
It makes two claims:
- **Existence**: All integers greater than 1 can be factorized into primes
  because each of them is [either composite or prime](#prime-factorization).
- **Uniqueness**: Suppose that there are integers greater than 1
  which have distinct [prime factorizations](#prime-factorization).
  Let $$n$$ be the smallest such integer
  so that $$n = p_1 \cdot p_2 \cdot … \cdot p_k = q_1 \cdot q_2 \cdot … \cdot q_l$$,
  where each $$p_i$$ and each $$q_j$$ is prime.
  Since $$p_1$$ divides $$n = q_1 \cdot q_2 \cdot … \cdot q_l$$,
  it has to divide one of the $$q_j$$s according to (a recursive application of) [Euclid's lemma](#euclids-lemma).
  Since we don't care about the order of the $$q_j$$s, let's assume that $$p_1$$ divides $$q_1$$.
  Since both $$p_1$$ and $$q_1$$ are prime and greater than 1, it follows that $$p_1 = q_1$$.
  When we cancel these factors on both sides of the equation,
  we get $$m = p_2 \cdot … \cdot p_k = q_2 \cdot … \cdot q_l$$.
  Given that the two factorizations of $$n$$ were distinct,
  these two factorizations of $$m$$ have to be distinct as well.
  Since $$m < n$$, $$n$$ cannot be the smallest integer with distinct prime factorizations,
  which is a [contradiction](https://en.wikipedia.org/wiki/Proof_by_contradiction).
  Thus, each positive integer can be represented by a unique [multiset of prime factors](#multiset-of-prime-factors).

</details>


### Multiplicative inverse revisited

Coming back to [multiplicative groups modulo some integer $$m$$](#multiplicative-groups) for a moment:
Why is it that only those integers have a [multiplicative inverse](#modular-multiplicative-inverse)
which are [coprime](#prime-factorization) with the group's modulus?
Coprimality is [necessary and sufficient](https://en.wikipedia.org/wiki/Necessity_and_sufficiency)
for an integer to have an inverse since:
- **Sufficient**: If an integer $$a$$ is coprime with the modulus $$m$$,
  [Bézout's identity](#bezouts-identity) tells us that there are two integers $$b$$ and $$n$$
  so that $$b \cdot a + n \cdot m = 1$$.
  This equation means that $$b \cdot a$$ equals $$1$$ up to a multiple of $$m$$, that is $$b \cdot a =_m 1$$.
  <!-- --> $$b$$ is therefore the multiplicative inverse of $$a$$ modulo $$m$$.
  The [extended Euclidean algorithm](#extended-euclidean-algorithm) can be used to determine $$b$$.
  This approach is usually much faster than [using exponentiation](#modular-multiplicative-inverse).
  The [above tool](#tool-integer-extended-euclidean-algorithm) marks the coefficient of the smaller number
  with a blue background whenever the [greatest common divisor](#greatest-common-divisor) is $$1$$.
  If you use the extended Euclidean algorithm only to determine the multiplicative inverse of $$a$$,
  you don't need to keep track of the coefficient of $$m$$
  (i.e. you don't have to implement the second to last column).
- **Necessary**: The second part of [Bézout's identity](#bezouts-identity) tells us
  that the closest you can get to a multiple of $$m$$ without reaching it is $$\operatorname{gcd}(a, m)$$.
  If an integer $$a$$ is not coprime with the modulus $$m$$, $$\operatorname{gcd}(a, m) > 1$$.
  Consequently, there is no integer $$b$$ so that $$b \cdot a =_m 1$$.
  For example, if both $$a$$ and $$m$$ are even,
  which means that their greatest common divisor is a multiple of $$2$$,
  you cannot reach an odd number, including $$1$$, by adding $$a$$ repeatedly to itself.

There is another important question to be answered:
Why are multiplicative groups closed if you limit the elements to the integers which are coprime with the modulus?
The best way to think about this is with [multisets of the prime factors](#multiset-of-prime-factors).
When you multiply two integers, you combine the multisets of their prime factors
by adding the multiplicities of each element.
For example, $$6 \cdot 15 = \{2, 3\} + \{3, 5\} = \{2, 3, 3, 5\} = 90$$.
If neither $$a$$ nor $$b$$ has prime factors in common with some integer $$m$$, then neither has $$a \cdot b$$.
Calculating the product [modulo $$m$$](#modulo-operation) doesn't change this fact
because the [congruence property](#congruence-relation) of modular multiplication
means that you can reduce integers to their remainder, not that you have to.
After all, the [Euclidean algorithm](#euclidean-algorithm) showed us that
subtracting the smaller number $$m$$ repeatedly from the larger number $$a \cdot b$$
does not change the [greatest common divisor](#greatest-common-divisor) of the two numbers.

Since the [order of a group](#group-order) plays a crucial role in cryptography, our next goal is to find a formula
which counts the [number of coprime integers](#eulers-totient-function) smaller than $$m$$.
On our way there, we'll study another famous result from number theory:
the [Chinese remainder theorem](#chinese-remainder-theorem).

<details markdown="block">
<summary markdown="span" id="least-common-multiple-and-0">
Least common multiple and 0
</summary>

There is another way to see why elements which share a prime factor with the modulus are undesirable.
If the integer $$a$$ is not coprime with the modulus $$m$$,
then [$$\operatorname{gcd}(a, m) > 1$$](#greatest-common-divisor)
and [$$\operatorname{lcm}(a, m) < a \cdot m$$](#least-common-multiple).
This means that there is some integer $$b < m$$ for which $$b \cdot a = \operatorname{lcm}(a, m)$$.
Since $$\operatorname{lcm}(a, m)$$ is also a multiple of $$m$$, $$b \cdot a =_m 0$$.
As I explained when I [introduced multiplicative groups](#multiplicative-groups),
<!-- --> $$0$$ has to be excluded from the set of elements.
Since a group has to be [closed](#group-axioms), we have to exclude $$a$$ or $$b$$.
This problem can be observed in the [operation table of multiplicative groups](#multiplicative-group-operation-table).
If we [set the modulus to 12](#tool-table-multiplicative-group-operation&modulus=12&coprime=false&zero=true&composite=false),
for example, we see that all the elements which are not coprime with the modulus
(the tool marks them with a blue background) reach $$0$$ at some point.
After that, the elements repeat because $$(b + 1) \cdot a =_m b \cdot a + 1 \cdot a =_m 0 + a =_m a$$.
The first factor for which we reach $$0$$
is $$b = \frac{\operatorname{lcm}(a, m)}{a} = \frac{m}{\operatorname{gcd}(a, m)}$$.
This means that there are $$\operatorname{gcd}(a, m)$$ repetitions in the rows and columns of non-coprime elements.
It also implies that the equation $$a \cdot x =_m c$$ has
[$$d = \operatorname{gcd}(a, m)$$ solutions](#solving-modular-equations) in $$\mathbb{Z}_m$$
if $$c$$ is a multiple of $$d$$ and [no solution otherwise](#bezouts-identity).

</details>

<details markdown="block">
<summary markdown="span" id="uniqueness-of-the-multiplicative-inverse">
Uniqueness of the multiplicative inverse
</summary>

As required by the [group axioms](#group-axioms),
the multiplicative inverse of a [coprime](#multiset-of-prime-factors) element is unique.
Suppose that the coprime element $$a$$ has two multiplicative inverses: $$b_1 \cdot a =_m 1$$ and $$b_2 \cdot a =_m 1$$.
It follows that $$b_1 \cdot a =_m b_2 \cdot a$$ and hence that $$b_1 \cdot a - b_2 \cdot a =_m 0$$.
This means that $$b_1 \cdot a - b_2 \cdot a = (b_1 - b_2) \cdot a$$ is a multiple of $$m$$.
Since $$\operatorname{\href{#greatest-common-divisor}{gcd}}(a, m) = 1$$, $$m$$ has to divide $$b_1 - b_2$$
according to a generalized version of [Euclid's lemma](#euclids-lemma).
(Its proof required only that $$p$$ and $$a$$ are coprime, which means that $$p$$ has to be
only [relatively prime](#multiset-of-prime-factors) to one of the factors, not "absolutely" prime.)
Therefore, $$b_1$$ has to equal $$b_2$$ up to a multiple of $$m$$.

</details>


### Chinese remainder theorem (CRT) {#chinese-remainder-theorem}
{:data-toc-text="Chinese remainder theorem"}

The [Chinese remainder theorem](https://en.wikipedia.org/wiki/Chinese_remainder_theorem) states that
if the remainders of an integer are known relative to several moduli
which are [coprime with one another](#multiset-of-prime-factors),
the integer is unique up to multiples of the product of the moduli.
More formally, the system of [congruences](#congruence-relation)

$$
\begin{aligned}
x &=_{m_1} r_1 \\
x &=_{m_2} r_2 \\
&\enspace \vdots \\
x &=_{m_l} r_l
\end{aligned}
$$

has a unique solution $$x$$ with $$0 ≤ x < M$$
if $$\operatorname{\href{#greatest-common-divisor}{gcd}}(m_i, m_j) = 1$$ for all $$i ≠ j$$,
where $$M = \href{#sum-and-product-of-similar-terms}{\prod_{i=1}^l} m_i$$.
The problem was first stated in [a Chinese text](https://en.wikipedia.org/wiki/Sunzi_Suanjing)
around the 4th century [CE](https://en.wikipedia.org/wiki/Common_Era).
The solution can be determined as follows:
Let $$M_i = M / m_i$$, which is the product of all moduli except $$m_i$$.
Given that $$m_i$$ has no prime factor in common with any of the other moduli, $$M_i$$ and $$m_i$$ are coprime.
Using the [extended Euclidean algorithm](#extended-euclidean-algorithm),
we find an $$N_i$$ so that $$N_i \cdot M_i =_{m_i} 1$$.
As $$M_i$$ is a multiple of all other moduli, $$N_i \cdot M_i =_{m_j} 0$$ for all $$j ≠ i$$.
Therefore, $$x =_M \href{#sum-and-product-of-similar-terms}{\sum_{i=1}^{l}} r_i \cdot N_i \cdot M_i$$
satisfies all congruences.
The solution is unique because for any two solutions,
<!-- --> $$x_1 - x_2 =_{m_i} 0$$ for all $$i$$ and thus also $$x_1 - x_2 =_M 0$$
because any multiple of coprime factors is also a multiple of their product.

The following tool implements this procedure for $$l = 2$$.
If you want to solve a larger system of congruences,
you can repeatedly replace any two equations with their solution
until only a single congruence is left, which is the solution to the whole system.
The case of $$l = 2$$ is special because $$M_1 = m_2$$ and $$M_2 = m_1$$,
which means that a single [Bézout's identity](#bezouts-identity) is enough to find the solution:

<div id="tool-integer-chinese-remainder-theorem"></div>

<details markdown="block">
<summary markdown="span" id="sum-and-product-of-similar-terms">
Sum and product of similar terms
</summary>

I used the following two shortcuts in the description of the Chinese remainder theorem,
which you might not be familiar with:
- [**Capital-sigma notation**](https://en.wikipedia.org/wiki/Summation#Capital-sigma_notation):
  <!-- --> $$\sum_{i=1}^{l} r_i \cdot N_i \cdot M_i = r_1 \cdot N_1 \cdot M_1 + … + r_l \cdot N_l \cdot M_l$$, and
- [**Capital-pi notation**](https://en.wikipedia.org/wiki/Multiplication#Capital_pi_notation):
  <!-- --> $$\prod_{i=1}^l m_i = m_1 \cdot … \cdot m_l$$,
  where $$i$$ is the [index](https://en.wikipedia.org/wiki/Index_notation) which is incremented.

</details>

<details markdown="block">
<summary markdown="span" id="signals-of-different-frequencies">
Signals of different frequencies
</summary>

The [Chinese remainder theorem](#chinese-remainder-theorem) is more intuitive than it may seem.
Given two pulses with coprime [repetition frequencies](https://en.wikipedia.org/wiki/Pulse_repetition_frequency),
it's clear that the [phase](https://en.wikipedia.org/wiki/Phase_(waves)#Phase_shift)
of one pulse shifts relative to the phase of the other pulse
until they re-align at the [least common multiple](#least-common-multiple):

<figure markdown="block">
{% include_relative generated/chinese-remainder-theorem.embedded.svg %}
<figcaption markdown="span">

Visualizing shifting repetitions on a [number line](https://en.wikipedia.org/wiki/Number_line)
with m<sub>1</sub> = 5 and m<sub>2</sub> = 7.

</figcaption>
</figure>

The offset between the two pulses has to be different throughout this cycle.
If the same offset occurred twice, the difference between the two occurrences would be a multiple of both frequencies
smaller than the least common multiple, which is a [contradiction](https://en.wikipedia.org/wiki/Proof_by_contradiction).
(This argument is similar to the one we used to establish that you [reach the identity element](#element-order)
before any of the group's elements can appear again when [repeating an element](#element-repetitions).)
This is also why all (and only) the coprime elements [generate the additive group](#additive-group-repetition-table).
In the above example, there are 5 offsets to cover and 5 green ticks before the cycle repeats.
Since no two offsets may be the same, all 5 offsets are covered due to the
[pigeonhole principle](https://en.wikipedia.org/wiki/Pigeonhole_principle#Alternative_formulations).
(On the other side of the number line, there are 7 offsets to cover with 7 blue ticks.)
The difference between the two remainders in the [tool above](#tool-integer-chinese-remainder-theorem)
determines into which repetition the solution falls.
For example, if the first remainder is one smaller than the second remainder,
the solution is 15 + r<sub>1</sub>.

</details>


### Group isomorphisms

A [group isomorphism](https://en.wikipedia.org/wiki/Group_isomorphism)
is an [invertible function](https://en.wikipedia.org/wiki/Bijection)
which maps the elements of one group to distinct elements of another group
so that the result of combining any two elements in one group
matches the result when combining the paired elements in the other group.
More formally, given two groups $$\mathbb{G}_1$$ and $$\mathbb{G}_2$$
with corresponding operations $$\circ_1$$ and $$\circ_2$$,
an invertible function $$f{:}\ \mathbb{G}_1 \to \mathbb{G}_2$$
defines a group isomorphism [if and only if](#if-and-only-if)
<!-- --> $$f(A \circ_1 B) = f(A) \circ_2 f(B)$$ for all $$A, B \in \mathbb{G}_1$$.
A group isomorphism can be visualized as follows:

<figure markdown="block">
{% include_relative generated/group-isomorphism.embedded.svg %}
<figcaption markdown="span">
An isomorphism between two groups.
</figcaption>
</figure>

You may have realized that this looks similar to our definition of a [linear one-way function](#definition).
The main differences are that the inputs to an isomorphism are the elements of a group, which don't have to be integers,
and that the operation doesn't have to resemble addition.
Moreover, an isomorphism may be easy to invert, thus neither "linear" nor "one-way" are appropriate adjectives.

If an isomorphism exists between the groups $$\mathbb{G}_1$$ and $$\mathbb{G}_2$$,
the groups are said to be isomorphic, which is usually written as $$\mathbb{G}_1 \cong \mathbb{G}_2$$.
For a function to be invertible, it has to map a single element of $$\mathbb{G}_1$$ to every element of $$\mathbb{G}_2$$.
As a consequence, isomorphic groups have the same [order](#group-order) ($$|\mathbb{G}_1| = |\mathbb{G}_2|$$),
and the [inverse of an isomorphism](https://en.wikipedia.org/wiki/Inverse_function) is also an isomorphism.
Furthermore, an isomorphism maps the identity element of $$\mathbb{G}_1$$ to the identity element of $$\mathbb{G}_2$$
because $$f(A) = f(A \circ_1 E) = f(A) \circ_2 f(E)$$ for all $$A \in \mathbb{G}_1$$.
It also maps the inverse $$\overline{A}$$ of each element $$A \in \mathbb{G}_1$$
to the inverse of $$f(A)$$ because $$f(A) \circ_2 f(\overline{A}) = f(A \circ_1 \overline{A}) = f(E)$$.
Since you reach the identity element in one group only when you reach it in the other group,
the [order](#element-order) of mapped elements is the same: $$|A| = |f(A)|$$.
Last but not least, either both groups are [commutative](#commutative-groups) or neither of them is.
In conclusion, isomorphic groups represent the same structure, they just use different labels for the elements.

<details markdown="block">
<summary markdown="span" id="isomorphism-of-cyclic-groups">
Isomorphism of cyclic groups
</summary>

All [cyclic groups](#cyclic-groups) of the same order are [isomorphic](#group-isomorphisms).
As we saw [earlier](#additive-group-repetition-table), [additive groups](#additive-groups) are always cyclic.
This means that all cyclic groups of order $$m$$ are isomorphic to [$$\mathbb{Z}_m^+$$](#additive-group-notations)
and thus [commutative](#commutative-groups).
Given a [generator](#group-generators) $$G$$, $$\href{#group-generators}{⟨G⟩} \cong \mathbb{Z}_m^+$$
[if and only if](#if-and-only-if) $$\lvert G \rvert = m$$.

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

<div class="text-center" markdown="block">
The function $$f(x) = xG$$ is a group isomorphism because:

<figure markdown="block">
{% include_relative generated/group-isomorphism-additive.embedded.svg %}
<figcaption markdown="span">
An isomorphism with $$\mathbb{Z}_m^+$$ using additive notation.
</figcaption>
</figure>

</div>

<div class="text-center" markdown="block">
The function $$f(x) = G^x$$ is a group isomorphism because:

<figure markdown="block">
{% include_relative generated/group-isomorphism-multiplicative.embedded.svg %}
<figcaption markdown="span">
An isomorphism with $$\mathbb{Z}_m^+$$ using multiplicative notation.
</figcaption>
</figure>

</div>

</div>

In [some](#discrete-logarithm-problem) [groups](#elliptic-curve-discrete-logarithm-problem),
the inverse isomorphism is [difficult to compute](#computational-complexity-theory),
giving us the [linear one-way functions](#linear-one-way-functions) we were looking for.

</details>


### Direct product

The [Cartesian product](https://en.wikipedia.org/wiki/Cartesian_product)
of the $$l$$ sets $$\mathbb{G}_1$$ to $$\mathbb{G}_l$$
is the set of $$l$$-[tuples](https://en.wikipedia.org/wiki/Tuple)
where the $$i$$-th component is an element of $$\mathbb{G}_i$$.
More formally:

$$
\mathbb{G}_1 \times … \times \mathbb{G}_l
= \{(A_1, …, A_l) \mid A_1 \in \mathbb{G}_1, …, A_l \in \mathbb{G}_l \}
$$

The product is named after [René Descartes](https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes) (1596 − 1650).
The product of $$l$$ groups forms a group with the following operation:

$$
(A_1, …, A_l) \circ (B_1, …, B_l) = (A_1 \circ_1 B_1, …, A_l \circ_l B_l)
$$

This so-called [direct product of groups](https://en.wikipedia.org/wiki/Direct_product_of_groups)
with such a component-wise operation fulfills all [group axioms](#group-axioms):
It is closed and associative because the operation in each of the groups is closed and associative,
the tuple consisting of each group's identity element is the identity element of the direct product,
and each element of the direct product has a unique inverse consisting of the component-wise inverses.
Being a Cartesian product, the [order of the direct product](#group-order) equals the product of each group's order:

$$
|\mathbb{G}_1 \times … \times \mathbb{G}_l| = |\mathbb{G}_1| \cdot … \cdot |\mathbb{G}_l|
$$

The [order of each element](#element-order) in the direct product
is the [least common multiple](#least-common-multiple) of the order of each component in its group:

$$
|(A_1, …, A_l)| = \operatorname{\href{#least-common-multiple}{lcm}}(|A_1|, …, |A_l|)
$$

Hence, the direct product is [cyclic](#cyclic-groups) [if and only if](#if-and-only-if)
the individual groups are all cyclic and their orders are coprime with one another.

<details markdown="block">
<summary markdown="span" id="internal-direct-product-of-commutative-subgroups">
Internal direct product of commutative subgroups
</summary>

Given two [subgroups](#subgroups) $$\mathbb{H_1}$$ and $$\mathbb{H_2}$$
of a [commutative group](#commutative-groups) $$\mathbb{G}$$
which have no element in common other than the [identity element](#group-axioms) $$E$$
(i.e. $$\mathbb{H_1} \cap \mathbb{H_2} = \{E\}$$),
the so-called [internal direct product](https://proofwiki.org/wiki/Definition:Internal_Group_Direct_Product)
<!-- --> $$\mathbb{H_1} \circ \mathbb{H_2} = \{A_1 \circ A_2 \mid A_1 \in \mathbb{H_1}, A_2 \in \mathbb{H_2}\}$$
is [isomorphic](#group-isomorphisms) to the [direct product](#direct-product) $$\mathbb{H_1} \times \mathbb{H_2}$$
(i.e. $$\mathbb{H_1} \times \mathbb{H_2} \cong \mathbb{H_1} \circ \mathbb{H_2}$$).
The isomorphism is given by the function $$f\big((A_1, A_2)\big) = A_1 \circ A_2$$,
which maps elements of $$\mathbb{H_1} \times \mathbb{H_2}$$ to elements of $$\mathbb{H_1} \circ \mathbb{H_2}$$.
In order to show that this is indeed an isomorphism,
we need to show that $$f$$ is compatible with the group operations
(i.e. $$f(A \circ_1 B) = f(A) \circ_2 f(B)$$) and invertible:
- **Compatibility**: $$f\big((A_1, A_2) \circ (B_1, B_2)\big)
  = f\big((A_1 \circ B_1, A_2 \circ B_2)\big)
  = (A_1 \circ B_1) \circ (A_2 \circ B_2)
  = (A_1 \circ A_2) \circ (B_1 \circ B_2)
  = f\big((A_1, A_2)\big) \circ f\big((B_1, B_2)\big)$$
  due to [associativity](#group-axioms) and [commutativity](#commutative-groups).
- **Invertibility** (a so-called [bijection](https://en.wikipedia.org/wiki/Bijection)):
  The function $$f$$ is invertible if the following two criteria are fulfilled:
  - **Distinct elements are mapped to distinct elements** ([injectivity](https://en.wikipedia.org/wiki/Injective_function)):
    This is the case if we obtain equal outputs [only for equal inputs](https://en.wikipedia.org/wiki/Contraposition).
    In other words, we need to show that $$f\big((A_1, A_2)\big) = f\big((B_1, B_2)\big)$$
    implies $$(A_1, A_2) = (B_1, B_2)$$.
    As $$A_1 \circ A_2 = B_1 \circ B_2$$, we have that $$\overline{B_1} \circ A_1 = B_2 \circ \overline{A_2}$$.
    Clearly, $$\overline{B_1} \circ A_1 \in \mathbb{H_1}$$ and $$B_2 \circ \overline{A_2} \in \mathbb{H_2}$$
    due to [closure](#group-axioms).
    Since the identity element is the only element which is in both $$\mathbb{H_1}$$ and $$\mathbb{H_2}$$,
    <!-- --> $$\overline{B_1} \circ A_1 = E$$ and $$B_2 \circ \overline{A_2} = E$$.
    Thus, $$A_1 = B_1$$ and $$A_2 = B_2$$.
  - **Every element of the target group is reached** ([surjectivity](https://en.wikipedia.org/wiki/Surjective_function)):
    Since every element in $$\mathbb{H_1} \circ \mathbb{H_2}$$ is of the form $$A_1 \circ A_2$$ by definition,
    there's an input for every element in $$\mathbb{H_1} \circ \mathbb{H_2}$$,
    namely $$(A_1, A_2)$$ because $$f\big((A_1, A_2)\big) = A_1 \circ A_2$$.

</details>

<details markdown="block">
<summary markdown="span" id="order-when-combining-two-elements-of-coprime-orders">
Order when combining two elements of coprime orders
</summary>

Given a finite [commutative group](#commutative-groups) $$\mathbb{G}$$
with two elements $$A_1$$ and $$A_2$$ so that $$\operatorname{\href{#greatest-common-divisor}{gcd}}(|A_1|, |A_2|) = 1$$,
the [order](#element-order) of $$A_1 \circ A_2$$ is $$|A_1| \cdot |A_2|$$.
Since $$A_1$$ [generates](#group-generators) the [subgroup](#subgroups) $$\href{#group-generators}{⟨A_1⟩}$$
and $$A_2$$ generates the subgroup $$⟨A_2⟩$$,
[their intersection is a subgroup](#intersection-of-subgroups-is-a-subgroup) of both $$⟨A_1⟩$$ and $$⟨A_2⟩$$.
By [Lagrange's theorem](#lagranges-theorem), $$|⟨A_1⟩ \cap ⟨A_2⟩|$$ divides both $$|⟨A_1⟩|$$ and $$|⟨A_2⟩|$$.
Since $$\operatorname{gcd}(|⟨A_1⟩|, |⟨A_2⟩|) = 1$$, $$|⟨A_1⟩ \cap ⟨A_2⟩|$$ has to equal $$1$$.
Since the [identity element](#group-axioms) $$E$$ is part of every subgroup, $$⟨A_1⟩ \cap ⟨A_2⟩ = \{E\}$$.
According to the [previous box](#internal-direct-product-of-commutative-subgroups),
<!-- --> $$⟨A_1⟩ \circ ⟨A_2⟩$$ is thus [isomorphic](#group-isomorphisms) to $$⟨A_1⟩ \times ⟨A_2⟩$$.
Therefore, $$|A_1 \circ A_2| = |(A_1, A_2)|
= \operatorname{\href{#least-common-multiple}{lcm}}(|A_1|, |A_2|) = |A_1| \cdot |A_2|$$.

</details>


### Composite groups

Given the $$l$$ coprime moduli $$m_1, …, m_l$$
and [their product](#sum-and-product-of-similar-terms) $$M = \prod_{i=1}^l m_i$$,
the [additive group](#additive-groups) $$\mathbb{Z}_M^+$$ is [isomorphic](#group-isomorphisms)
to the [direct product](#direct-product) of $$\mathbb{Z}_{m_1}^+, …, \mathbb{Z}_{m_l}^+$$,
written as follows:

$$
\mathbb{Z}_M^+ \cong \mathbb{Z}_{m_1}^+ \times … \times \mathbb{Z}_{m_l}^+
$$

Let us verify this step by step.
Since the [order of additive groups](#group-order) is given by the modulus,
both groups contain the same number of elements:
<!-- --> $$|\mathbb{Z}_M^+| = |\mathbb{Z}_{m_1}^+| \cdot … \cdot |\mathbb{Z}_{m_l}^+| = M$$.
According to the [Chinese remainder theorem](#chinese-remainder-theorem),
there's a unique element in $$\mathbb{Z}_M^+$$
for every element of $$\mathbb{Z}_{m_1}^+ \times … \times \mathbb{Z}_{m_l}^+$$.
As a consequence, the function $$f(x) = (x\ \href{#modulo-operation}{\%}\ m_1, …, x\ \%\ m_l)$$
is [invertible](https://en.wikipedia.org/wiki/Bijection).
<!-- --> $$f(x)$$ is an [isomorphism](#group-isomorphisms) because [modular equivalence](#equivalence-relation)
is a [congruence relation](#congruence-relation) for any modulus:
$$f(A + B) = ((A + B)\ \%\ m_1, …, (A + B)\ \%\ m_l)
= (A\ \%\ m_1, …, A\ \%\ m_l) + (B\ \%\ m_1, …, B\ \%\ m_l) = f(A) + f(B)$$
for any $$A, B \in \mathbb{Z}_M^+$$.

The same function is also an isomorphism for [multiplicative groups](#multiplicative-groups)
because $$(A \cdot B)\ \%\ m_i =_{m_i} (A\ \%\ m_i) \cdot (B\ \%\ m_i)$$:

$$
\mathbb{Z}_M^\times \cong \mathbb{Z}_{m_1}^\times \times … \times \mathbb{Z}_{m_l}^\times
$$

Both groups contain the same number of elements because an integer is [coprime](#multiset-of-prime-factors) with $$M$$
[if and only if](#if-and-only-if) it is coprime with all moduli $$m_1, …, m_l$$.
This gives us an easy way to determine the number of elements in multiplicative groups modulo a composite integer,
as&nbsp;we shall see in the [next section](#eulers-totient-function).

You can display the decomposition of each element [modulo](#modulo-operation)
the [prime factors](#prime-factorization) of the modulus in the operation tables
of [additive groups](#additive-group-operation-table)
and [multiplicative groups](#multiplicative-group-operation-table)
by [enabling the "Product" option](#tool-table-multiplicative-group-operation&composite=true).
For example, [$$\mathbb{Z}_{35}^\times \cong \mathbb{Z}_{5}^\times \times \mathbb{Z}_{7}^\times$$](#tool-table-multiplicative-group-operation&modulus=35&coprime=false&composite=true).
Instead of multiplying two elements in $$\mathbb{Z}_{35}^\times$$,
you can multiply their components in $$\mathbb{Z}_{5}^\times$$ and $$\mathbb{Z}_{7}^\times$$.
For example, $$[11 \leftrightarrow (1, 4)] \cdot [8 \leftrightarrow (3, 1)] = [18 \leftrightarrow (3, 4)]$$.
Decomposing a composite group into a [direct product](#direct-product) of its factors is another way to see
why only coprime elements [have an inverse](#multiplicative-inverse-revisited)
because multiples of the prime factors are mapped to $$0$$ in the corresponding group
and $$0$$ has no multiplicative inverse.


### Euler's totient function φ {#eulers-totient-function}
{:data-toc-text="Euler's totient function"}

As explained [earlier](#multiplicative-inverse-revisited),
[multiplicative groups](#multiplicative-groups) contain all the integers between $$0$$ and $$m$$
which are [coprime](#multiset-of-prime-factors) with the modulus $$m$$.
So how many coprime integers below $$m$$ are there?
We answer this question by starting with the simplest case and generalizing from there:
- $$m = p$$ for some prime $$p$$: All integers strictly between $$0$$ and $$p$$ (i.e. $$0 < x < p$$) are coprime with $$p$$.
  Using the [Greek letter phi](https://en.wikipedia.org/wiki/Phi) to denote the function
  which returns the number of coprime integers smaller than its input, $$\varphi(p) = p - 1$$.
- $$m = p^e$$ for some prime $$p$$ and a positive integer $$e$$:
  All integers between $$0$$ and $$p^e$$ except the multiples of $$p$$ are coprime with $$p^e$$.
  Since $$0 < c \cdot p < p^e$$ for $$0 < c < p^{e-1}$$,
  there are $$p^{e-1} - 1$$ multiples of $$p$$ which have to be excluded.
  Therefore, $$\varphi(p^e) = (p^e - 1) - (p^{e-1} - 1) = p^e - p^{e-1} = p^{e-1} \cdot (p - 1)$$.
- $$m = p_1^{e_1} \cdot … \cdot p_l^{e_l}$$ for $$l$$ distinct primes with positive exponents:
  Since [powers of different primes](https://en.wikipedia.org/wiki/Prime_power) are coprime with one another,
  <!-- --> $$\mathbb{Z}_m^\times \cong \mathbb{Z}_{p_1^{e_1}}^\times \times … \times \mathbb{Z}_{p_l^{e_l}}^\times$$
  according to the [previous section](#composite-groups).
  [Therefore](#direct-product),
  <!-- --> $$\varphi(p_1^{e_1} \cdot … \cdot p_l^{e_l}) = \varphi(p_1^{e_1}) \cdot … \cdot \varphi(p_l^{e_l})$$.

Given the [prime factorization](#prime-factorization) of $$m = p_1^{e_1} \cdot … \cdot p_l^{e_l}$$,
the number of coprime integers below $$m$$ is given by the following formula:

$$
\varphi(m)
= \prod_{i=1}^l \varphi(p_i^{e_i})
= \prod_{i=1}^l p_i^{e_i} - p_i^{e_i-1}
= \prod_{i=1}^l p_i^{e_i-1} \cdot (p_i - 1)
$$

This is known as [Euler's totient function](https://en.wikipedia.org/wiki/Euler%27s_totient_function),
named after [Leonhard Euler](https://en.wikipedia.org/wiki/Leonhard_Euler) (1707 − 1783).
([Totient](https://en.wiktionary.org/wiki/totient) comes from the Latin "tot", which means "that many".)
Since the computation of Euler's totient function requires the prime factorization of the given input,
I've included it in the [prime factorization tool](#tool-integer-factorization-trial-division) above;
you just have to [activate the "Totients" toggle](#tool-integer-factorization-trial-division&totients=true).

<details markdown="block" open>
<summary markdown="span" id="eulers-theorem">
Euler's theorem
</summary>

[Euler's theorem](https://en.wikipedia.org/wiki/Euler%27s_theorem)
is a generalization of [Fermat's little theorem](#fermats-little-theorem):
For any coprime integers $$a$$ and $$m$$, we have that $$a^{\varphi(m)} =_m 1$$.

</details>

<details markdown="block">
<summary markdown="span" id="number-of-generators-in-cyclic-groups">
Number of generators in cyclic groups
</summary>

We [saw](#isomorphism-of-cyclic-groups) that all [cyclic groups](#cyclic-groups)
are [isomorphic](#group-isomorphisms) to the [additive group](#additive-groups) of the same order.
Any element $$A$$ that is coprime with the modulus $$m$$ generates the additive group
because $$mA$$ is the first time you get a multiple of $$m$$.
(If there was a smaller number $$n$$ such that $$nA =_m 0$$,
then the [least common multiple](#least-common-multiple) of $$A$$ and $$m$$ would be smaller than $$mA$$,
which means that their [greatest common divisor](#greatest-common-divisor) would be larger than $$1$$.)
As a consequence, the number of generators of any cyclic group $$\mathbb{G}$$ is given by $$\varphi(|\mathbb{G}|)$$.

</details>

<details markdown="block">
<summary markdown="span" id="sum-of-eulers-totient-function-over-divisors">
Sum of Euler's totient function over divisors
</summary>

As shown [earlier](#all-subgroups-of-cyclic-groups-are-cyclic),
all [subgroups](#subgroups) of [cyclic groups](#cyclic-groups) are cyclic,
and a unique subgroup exists for every [divisor](#divisor) $$d$$ of the [group's order](#group-order) $$n$$.
Since subgroups are groups,
the cyclic subgroup of order $$d$$ has [$$\varphi(d)$$ generators](#number-of-generators-in-cyclic-groups).
This means that in a cyclic group of order $$n$$,
there are exactly $$\varphi(d)$$ elements of order $$d$$ for every divisor $$d$$ of $$n$$.
According to [Lagrange's theorem](#lagranges-theorem),
each of the $$n$$ elements has an order which divides $$n$$.
This implies that the sum of the [Euler's totient function](#eulers-totient-function)
of every divisor $$d$$ of $$n$$ equals $$n$$:

$$
\sum_{d\ \mid\ n} \varphi(d) = n \textsf{, where } \varphi(1) = 1 \textsf{.}
$$

If you [enable the "Totient" option](#tool-table-additive-group-repetition&totient=true)
in the [repetition](#additive-group-repetition-table) [tables](#multiplicative-group-repetition-table) above,
you see the output of the Euler's totient function for every divisor of the group's order in a separate row.
The sum of all the values in this row plus $$1$$ for the [identity element](#group-axioms),
whose count is covered by the label $$\varphi(i)$$, equals the number of elements in the group.
Please note that the value in the totient row matches the number of elements with the given order only if the group is cyclic.

</details>


### Carmichael's totient function λ {#carmichaels-totient-function}
{:data-toc-text="Carmichael's totient function"}

As mentioned [earlier](#multiplicative-group-repetition-table),
not all [multiplicative groups](#multiplicative-groups) are [cyclic](#cyclic-groups).
We use the [Greek letter lambda](https://en.wikipedia.org/wiki/Lambda)
to denote the function which returns the largest order among the elements of the group:
<!-- --> $$\lambda(m) = \max_{A \in \mathbb{Z}_m^\times} |A|$$.
This is known as [Carmichael's (totient) function](https://en.wikipedia.org/wiki/Carmichael_function),
named after [Robert Daniel Carmichael](https://en.wikipedia.org/wiki/Robert_Daniel_Carmichael) (1879 − 1967).
We shall see shortly that for [prime powers](https://en.wikipedia.org/wiki/Prime_power),
its value can be computed as follows:

$$
\lambda(p^e) = \begin{cases}
\frac{1}{2}\varphi(p^e) = 2^{e-2} &\text{if } p = 2 \text{ and } e > 2 \text{,} \\
\varphi(p^e) = p^{e-1}(p - 1) &\text{otherwise.}
\end{cases}
$$

For other integers, $$\mathbb{Z}_m^\times$$ is a [composite group](#composite-groups).
Since the order of each element in $$\mathbb{Z}_{p^e}^\times$$ divides $$\lambda(p^e)$$
as we'll see [below](#exponent-of-a-multiplicative-group),
the largest [element order](#element-order) in a [direct product](#direct-product)
is the [least common multiple](#least-common-multiple) of the largest element order in each of the composing groups:

$$
\lambda(p_1^{e_1} \cdot … \cdot p_l^{e_l})
= \operatorname{lcm}(\lambda(p_1^{e_1}), …, \lambda(p_l^{e_l}))
$$

Given my definition of Carmichael's totient function as $$\lambda(m) = \max_{A \in \mathbb{Z}_m^\times} |A|$$,
which is [different from but equivalent to](#exponent-of-a-multiplicative-group) what you encounter elsewhere,
and the definition of [Euler's totient function](#eulers-totient-function) as $$\varphi(m) = |\mathbb{Z}_m^\times|$$,
the multiplicative group $$\mathbb{Z}_m^\times$$ is cyclic [if and only if](#if-and-only-if) $$\lambda(m) = \varphi(m)$$.
According to the first formula, $$\lambda(p^e) = \varphi(p^e)$$ if and only if $$p ≠ 2$$ or $$e ≤ 2$$.
And since $$\varphi(p^e) = p^{e-1}(p - 1)$$ is even for any prime power other than $$2^1$$,
<!-- --> $$\operatorname{\href{#greatest-common-divisor}{gcd}}(\varphi(p_1^{e_1}), \varphi(p_2^{e_2})) ≥ 2$$
and thus $$\operatorname{\href{#least-common-multiple}{lcm}}(\varphi(p_1^{e_1}), \varphi(p_2^{e_2}))
< \varphi(p_1^{e_1}) \cdot \varphi(p_2^{e_2})$$ if neither $$p_1^{e_1}$$ nor $$p_2^{e_2}$$ equals $$2^1$$.
Therefore, multiplicative groups are cyclic
if and only if the modulus $$m$$ equals $$2$$, $$4$$, $$p^e$$, or $$2p^e$$
for a prime $$p ≠ 2$$ and a positive integer $$e$$.
You can verify this for moduli up to 100 with the [repetition table tool](#multiplicative-group-repetition-table).
(This is why the tool displays the [prime factorization](#prime-factorization) of the modulus above the table.)
You can compute Carmichael's totient function of an integer
by [enabling the "Totients" option](#tool-integer-factorization-trial-division&totients=true)
of the [factorization tool](#tool-integer-factorization-trial-division).

The math required to understand the formula for $$\lambda(p^e)$$ is a bit advanced,
which is why I cover it in several [information boxes](/#information-boxes) below.
In fact, it was rather difficult to find a satisfying explanation online.
I adapted the following proof from [Victor Shoup's book](https://shoup.net/ntb/ntb-v2.pdf)
starting on the pages 160 and 203.
You find an alternative approach [here](https://pi.math.cornell.edu/~mathclub/Media/mult-grp-cyclic-az.pdf).

<details markdown="block">
<summary markdown="span" id="order-of-prime-power">
Order of prime power
</summary>

<div class="tabbed keep-margin" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

For any element $$A$$ of a group $$\mathbb{G}$$,
if $$p^eA = O$$ and $$p^{e-1}A ≠ O$$ for some prime $$p$$ and a positive integer $$e$$,
then $$|A| = p^e$$.
The reason for this is that whatever the [order](#element-order) of $$A$$ is,
it has to divide $$p^e$$ given that $$p^eA = O$$.
Only powers of $$p$$ divide $$p^e$$,
but the order of $$A$$ cannot have a smaller exponent than $$e$$ because $$p^{e-1}A ≠ O$$.

For any element $$A$$ of a group $$\mathbb{G}$$,
if $$A^{p^e} = I$$ and $$A^{p^{e-1}} ≠ I$$ for some prime $$p$$ and a positive integer $$e$$,
then $$|A| = p^e$$.
The reason for this is that whatever the [order](#element-order) of $$A$$ is,
it has to divide $$p^e$$ given that $$A^{p^e} = I$$.
Only powers of $$p$$ divide $$p^e$$,
but the order of $$A$$ cannot have a smaller exponent than $$e$$ because $$A^{p^{e-1}} ≠ I$$.

</div>

</details>

<details markdown="block">
<summary markdown="span" id="exponent-of-a-multiplicative-group">
Exponent of a multiplicative group
</summary>

The so-called exponent of the [multiplicative group](#finite-groups) $$\mathbb{Z}_m^\times$$
is the smallest positive integer $$n$$ so that $$A^n =_m 1$$ for all elements $$A$$ of the group.
Clearly, $$n$$ divides the [order of the group](#group-order)
and is a multiple of the [order of each element](#element-order), including the largest one.
In this box, we show that an element of order $$n$$ exists,
which implies that $$\lambda(m) = n$$ and $$A^{\lambda(m)} =_m 1$$
for any number $$A$$ which is [coprime](#multiset-of-prime-factors) with the modulus $$m$$.
This is in fact how [Carmichael's totient function](#carmichaels-totient-function) is usually defined.
Since $$\lambda(m) ≤ \varphi(m)$$ for any positive integer $$m$$,
Carmichael's totient function gives a tighter exponent than [Euler's totient function](#eulers-totient-function)
in [Euler's theorem](#eulers-theorem).

Let $$\prod_{i=1}^l p_i^{e_i}$$ be the [prime factorization](#prime-factorization) of the exponent $$n$$.
For each $$i$$ between (and including) $$1$$ and $$l$$,
there exists an element $$A_i \in \mathbb{Z}_m^\times$$ so that $$A_i^{n/p_i} ≠_m 1$$.
If no such $$A_i$$ could be found for some $$i$$, $$n/p_i$$ would be an exponent smaller than $$n$$
which results in $$1$$ for all elements of the group,
which would [contradict](https://en.wikipedia.org/wiki/Proof_by_contradiction) the minimality of $$n$$.
Given such an element $$A_i$$ for each $$i$$, the element $$A_i^{n/p_i^{e_i}}$$ has order $$p_i^{e_i}$$
because $$(A_i^{n/p_i^{e_i}})^{p_i^{e_i}} =_m A_i^n =_m 1$$
and $$(A_i^{n/p_i^{e_i}})^{p_i^{e_i - 1}} =_m A_i^{n/p_i} ≠_m 1$$
(see the [previous box](#order-of-prime-power)).
As all the prime powers of a prime factorization are coprime with one another,
the order of $$\prod_{i=1}^l A_i^{n/p_i^{e_i}}$$ is $$n$$
according to an [earlier theorem](#order-when-combining-two-elements-of-coprime-orders).

</details>

<details markdown="block">
<summary markdown="span" id="why-multiplicative-groups-modulo-a-prime-are-cyclic">
Why multiplicative groups modulo a prime are cyclic
</summary>

Let's start with the simplest case: $$\mathbb{Z}_p^\times$$ is [cyclic](#cyclic-groups)
if $$p$$ is [prime](#prime-factorization).
In order to prove this, we need math which we haven't covered yet:
1. $$\href{#integers-modulo-m}{\mathbb{Z}_p} = \{0, …, p - 1\}$$ is a finite field
   over which [polynomials](https://en.wikipedia.org/wiki/Polynomial) can be defined.
   We'll discuss finite fields [later in this article](#finite-fields).
2. A [non-constant](https://en.wikipedia.org/wiki/Polynomial#constant_polynomial)
   [single-variable](https://en.wikipedia.org/wiki/Polynomial#univariate)
   polynomial of [degree](https://en.wikipedia.org/wiki/Degree_of_a_polynomial) $$d$$
   over any field evaluates to $$0$$ for at most $$d$$ distinct inputs.
   In other words, $$f(x) = \sum_{i=0}^d c_i x^i$$
   with some [coefficients](https://en.wikipedia.org/wiki/Coefficient)
   <!-- --> $$c_0,\allowbreak …,\allowbreak c_d \in \mathbb{Z}_p$$ where $$d > 0$$ and at least $$c_d ≠ 0$$
   has at most $$d$$ [roots](https://en.wikipedia.org/wiki/Zero_of_a_function).
   Confusingly enough, this statement is also known
   as [Lagrange's theorem](https://en.wikipedia.org/wiki/Lagrange%27s_theorem_(number_theory)).
   When formulated over the field of [complex numbers](https://en.wikipedia.org/wiki/Complex_number),
   it is also known as the [fundamental theorem of algebra](https://en.wikipedia.org/wiki/Fundamental_theorem_of_algebra).
   We'll prove it in the article about coding theory.

We learned in the [previous box](#exponent-of-a-multiplicative-group)
that $$A^{\lambda(p)} =_p 1$$ for all elements $$A$$ of $$\mathbb{Z}_p^\times$$.
This means that the polynomial $$f(X) =_p X^{\lambda(p)} - 1$$ evaluates to $$0$$
for all $$\varphi(p) = p - 1$$ elements of $$\mathbb{Z}_p^\times$$.
Since a polynomial of degree $$\lambda(p)$$ over a field can have at most $$\lambda(p)$$ roots,
<!-- --> $$\lambda(p)$$ cannot be smaller than $$\varphi(p)$$.
Therefore, $$\lambda(p) = \varphi(p)$$, which implies that $$\mathbb{Z}_p^\times$$ is cyclic.
Please note that this argument works only for fields (i.e. [if the modulus is prime](#integers-modulo-p)).
In $$\mathbb{Z}_{24}$$, for example, $$X^2 - 1 =_{24} 0$$ has
[8 solutions](#tool-table-multiplicative-group-repetition&modulus=24&coprime=true&repeat=false&order=false&totient=false).

Even though we know that $$\mathbb{Z}_p^\times$$ is cyclic for any prime $$p$$
and that it has [$$\varphi(p - 1)$$ generators](#number-of-generators-in-cyclic-groups),
no formula is known for finding a [generator](#group-generators) without searching.
We'll discuss how to find a generator for a [multiplicative group](#multiplicative-groups)
in the [last section](#search-for-a-group-generator) of this chapter.

Since $$\mathbb{Z}_{p^e}$$ is not a field for any integer $$e > 1$$, we
[need](#binomial-coefficients-and-binomial-the-theorem)
[four](#binomial-coefficients-of-a-prime-are-multiples-of-the-prime)
[additional](#congruence-after-exponentiation-modulo-a-prime-power)
[facts](#congruence-of-1-plus-prime-power-after-exponentiation)
to prove that $$\mathbb{Z}_{p^e}^\times$$ is cyclic for any odd prime $$p$$.

</details>

<details markdown="block">
<summary markdown="span" id="binomial-coefficients-and-binomial-the-theorem">
Binomial coefficients and the binomial theorem
</summary>

Since multiplication [distributes](https://en.wikipedia.org/wiki/Distributive_property) over addition,
we have that $$(a + b)(c + d) = a(c + d) + b(c + d) = ac + ad + bc + bd$$.
More generally, when evaluating the product of two sums, you add up all possible products
of a term from the first sum and a term from the second sum.
If the two sums are the same, you get some products several times:
<!-- --> $$(a + b)^2 = (a + b)(a + b) = aa + ab + ba + bb = a^2 + 2ab + b^2$$.
The same is true for powers greater than $$2$$.
In the case of $$(a + b)^n$$, each product consists of $$n$$ instead of $$2$$ terms.
How many times do we obtain the product $$a^ib^{n-i}$$ for some integer $$i$$ between $$0$$ and $$n$$
when we expand $$(a + b)^n$$?
The first $$a$$ can be chosen from any of the $$n$$ sums,
the second $$a$$ from any of the remaining $$n - 1$$ sums,
and so on until you have $$n - i + 1$$ options left for the $$i$$<sup>th</sup> $$a$$.
Since we don't care about the order in which we picked the $$a$$s in a specific product of $$a$$s and $$b$$s,
we have to divide the integer that we obtained so far by the number of ways in which $$i$$ $$a$$s can be ordered.
The first $$a$$ can be any of the $$i$$ $$a$$s, the second $$a$$ any of the remaining $$i - 1$$ $$a$$s, and so on.
<!-- --> $$i \cdot (i - 1) \cdot … \cdot 2 \cdot 1$$
is the so-called [factorial](https://en.wikipedia.org/wiki/Factorial) of $$i$$,
which is usually written with an [exclamation mark](https://en.wikipedia.org/wiki/Exclamation_mark) as $$i!$$.
The number of ways in which you can pick $$i$$ $$a$$s out of $$n$$ sums is:

$$
\binom{n}{i} = \frac{n (n-1) (n-2) … (n-i+1)}{i (i-1) (i-2) … 1} = \frac{n!}{i!\,(n-i)!}
\quad \text{for } 0 ≤ i ≤ n
$$

This is known as the [binomial coefficient](https://en.wikipedia.org/wiki/Binomial_coefficient),
which is often written as the two numbers above each other in
[parentheses](https://en.wikipedia.org/wiki/Bracket#Parentheses).
Since no choice is left for the $$n - i$$ $$b$$s, we don't need to account for them.
Instead of choosing the $$i$$ $$a$$s, we could choose the $$n - i$$ $$b$$s, though,
which would give us the same result as $$\binom{n}{i} = \binom{n}{n - i}$$.
Putting everything together, we get the [binomial theorem](https://en.wikipedia.org/wiki/Binomial_theorem):

$$
(a + b)^n = \sum_{i=0}^n \binom{n}{i} a^ib^{n-i}
$$

</details>

<details markdown="block">
<summary markdown="span" id="binomial-coefficients-of-a-prime-are-multiples-of-the-prime">
Binomial coefficients of a prime are multiples of the prime
</summary>

[$$\binom{p}{i} =_p 0$$](https://proofwiki.org/wiki/Binomial_Coefficient_of_Prime)
for any [prime](#prime-factorization) $$p$$ and any integer $$i$$ strictly between $$0$$ and $$p$$ (i.e. $$0 < i < p$$).
Proof: Since $$\binom{p}{i} = \frac{p (p-1) (p-2) … (p-i+1)}{i!}$$ must be an integer
[given what it counts](#binomial-coefficients-and-binomial-the-theorem),
<!-- --> $$i!$$ divides $$p (p-1) (p-2) … (p-i+1)$$.
Since $$p$$ is prime and all factors in $$i!$$ are smaller than $$p$$,
<!-- --> $$\operatorname{\href{#greatest-common-divisor}{gcd}}(p, i!) = 1$$.
By [Euclid's lemma](#euclids-lemma), $$i!$$ then has to divide $$(p-1) (p-2) … (p-i+1)$$.
Therefore, $$\binom{p}{i}$$ is a multiple of $$p$$.

</details>

<details markdown="block">
<summary markdown="span" id="congruence-after-exponentiation-modulo-a-prime-power">
Congruence after exponentiation modulo a prime power
</summary>

Given a prime $$p$$ and a positive integer $$e$$,
<!-- --> $$a =_{p^e} b$$ implies $$a^p =_{p^{e+1}} b^p$$ for any integers $$a$$ and $$b$$.

Proof: $$a =_{p^e} b$$ means that $$a = b + cp^e$$ for some integer $$c$$.
Thus, $$a^p = (b + cp^e)^p = b^p + pb^{p-1}cp^e + dp^{2e}$$ for some integer $$d$$.
(See the [binomial theorem](#binomial-coefficients-and-binomial-the-theorem) if you struggle with this expansion.)
As a consequence, $$a^p$$ equals $$b^p$$ up to some multiple of $$p^{e+1}$$.

</details>

<details markdown="block">
<summary markdown="span" id="congruence-of-1-plus-prime-power-after-exponentiation">
Congruence of 1 plus prime power after exponentiation
</summary>

Given a prime $$p$$ and a positive integer $$e$$ with $$p^e > 2$$,
<!-- --> $$a =_{p^{e+1}} 1 + p^e$$ implies $$a^p =_{p^{e+2}} 1 + p^{e+1}$$ for any integers $$a$$ and $$b$$.

Proof: According to the [previous box](#congruence-after-exponentiation-modulo-a-prime-power),
<!-- --> $$a =_{p^{e+1}} 1 + p^e$$ implies $$a^p =_{p^{e+2}} (1 + p^e)^p$$.
Using the [binomial theorem](#binomial-coefficients-and-binomial-the-theorem), we get:

$$
(1 + p^e)^p
= \sum_{i=0}^p \binom{p}{i} (p^e)^i
= 1 + p \cdot p^e + \Big( \sum_{i=2}^{p-1} \binom{p}{i} p^{ei} \Big) + p^{ep}
$$

Since $$\binom{p}{i}$$ is [divisible by $$p$$](#binomial-coefficients-of-a-prime-are-multiples-of-the-prime)
for $$0 < i < p$$, we conclude that $$\binom{p}{i} p^{ei}$$ is divisible by $$p^{1+2e}$$ for $$2 ≤ i < p$$.
Since $$1 + 2e ≥ e + 2$$ for all $$e ≥ 1$$, we can ignore the terms of the second sum
when computing [modulo](#modulo-operation) $$p^{e+2}$$.
By the requirement that $$p^e > 2$$, either $$p ≥ 3$$ or $$e ≥ 2$$.
In both cases, $$ep ≥ e + 2$$.
Therefore, we can ignore $$p^{ep}$$ as well,
which leaves us with $$(1 + p^e)^p =_{p^{e+2}} 1 + p^{e+1}$$.

</details>

<details markdown="block">
<summary markdown="span" id="why-multiplicative-groups-modulo-a-power-of-an-odd-prime-are-cyclic">
Why multiplicative groups modulo a power of an odd prime are cyclic
</summary>

In this box, we want to show that $$\mathbb{Z}_{p^e}^\times$$ is [cyclic](#cyclic-groups)
for any odd prime $$p$$ and any integer $$e > 1$$.
We learned [earlier](#why-multiplicative-groups-modulo-a-prime-are-cyclic) that $$\mathbb{Z}_p^\times$$ is cyclic.
Let $$G$$ be a [generator](#group-generators) of $$\mathbb{Z}_p^\times$$
and $$n$$ be the [order](#element-order) of $$G$$ in $$\mathbb{Z}_{p^e}^\times$$.
Since $$G^n =_{p^e} 1$$, $$G^n =_p 1$$.
(If $$G^n - 1$$ is a multiple of $$p^e$$, it is also a multiple of $$p$$ because $$p^e$$ is a multiple of $$p$$.)
Therefore, $$n$$ has to be a multiple of $$p - 1$$, which is the [order](#group-order) of $$\mathbb{Z}_p^\times$$.
Since $$n$$ is the smallest positive integer so that $$G^n =_{p^e} 1$$,
<!-- --> $$G^{n/(p-1)}$$ has an order of $$p - 1$$ in $$\mathbb{Z}_{p^e}^\times$$.
If we find an element $$H$$ with an order of $$p^{e-1}$$ in $$\mathbb{Z}_{p^e}^\times$$,
then $$H \cdot G^{n/(p-1)}$$ has an order of $$p^{e-1} (p - 1) = \varphi(p^e)$$
according to an [earlier theorem](#order-when-combining-two-elements-of-coprime-orders).

We now show that $$H = 1 + p$$ has an order of $$p^{e-1}$$ in $$\mathbb{Z}_{p^e}^\times$$.
According to the [previous box](#congruence-of-1-plus-prime-power-after-exponentiation),
<!-- --> $$H =_{p^2} 1 + p$$ implies $$H^p =_{p^3} 1 + p^2$$.
If $$e > 2$$, $$p^e$$ is a multiple of $$p^3$$, and thus $$H^p ≠_{p^e} 1$$.
When we raise $$H^p$$ to the power of $$p$$ again, we get $$H^{p^2} =_{p^4} 1 + p^3$$.
This continues until $$H^{p^{e-1}} =_{p^{e+1}} 1 + p^e =_{p^e} 1$$.
Since this is the first time that we reach the identity element,
the order of $$H$$ is $$p^{e-1}$$.

</details>

<details markdown="block">
<summary markdown="span" id="why-multiplicative-groups-modulo-a-power-of-2-greater-than-4-are-not-cyclic">
Why multiplicative groups modulo a power of 2 greater than 4 are not cyclic
</summary>

You can use the [repetition table](#multiplicative-group-repetition-table) to verify
that [$$\mathbb{Z}_2^\times$$](#tool-table-multiplicative-group-repetition&modulus=2&coprime=true&repeat=false)
and [$$\mathbb{Z}_4^\times$$](#tool-table-multiplicative-group-repetition&modulus=4&coprime=true&repeat=false)
are [cyclic](#cyclic-groups) and
that [$$\mathbb{Z}_8^\times$$](#tool-table-multiplicative-group-repetition&modulus=8&coprime=true&repeat=false)
has no [generator](#group-generators).
In this box, we first show that every element in $$\mathbb{Z}_{2^e}^\times$$ for an integer $$e > 2$$
has an [order](#element-order)
of [at most $$2^{e - 2}$$](https://en.wikipedia.org/wiki/Carmichael_function#Extension_for_powers_of_two).
This is an upper bound for $$\lambda(2^e)$$.
By showing that the element $$5$$ has this order, we establish the same value as a lower bound,
which implies that $$\lambda(2^e) = 2^{e - 2}$$ for $$e > 2$$.

We first observe that all even integers have the factor $$2$$ in common with powers of $$2$$
and that all odd integers are [coprime](#multiset-of-prime-factors) with powers of $$2$$.
Therefore, any element $$A \in \mathbb{Z}_{2^e}^\times$$ can be written as $$A = 1 + 2b$$ for some integer $$b$$.
Using our [algebraic skills](#binomial-coefficients-and-binomial-the-theorem),
<!-- --> $$A^2 = (1 + 2b)^2 = 1 + 4b + 4b^2 = 1 + 4b(1 + b)$$.
Since either $$b$$ or $$1 + b$$ is even, $$c = \frac{b(1 + b)}{2}$$ is an integer.
Therefore, $$A^2 = 1 + 8c$$.
For $$e = 3$$, we have seen that $$A^{2^{e-2}} = 1 + 2^ec$$,
which means that $$A^{2^{e-2}} =_{2^e} 1$$.
By [induction](https://en.wikipedia.org/wiki/Mathematical_induction),
we show that this is also true for any $$e > 3$$:
<!-- --> $$(A^{2^{e-2}})^2 = A^{2^{e-1}} = (1 + 2^ec)^2 = 1 + 2 \cdot 2^ec + 2^{2e}c^2 = 1 + 2^{e+1}(c + 2^{e-1}c^2)$$,
which means that $$A^{2^{e-1}} =_{2^{e+1}} 1$$.

With the same argument as in the [previous box](#why-multiplicative-groups-modulo-a-power-of-an-odd-prime-are-cyclic),
we prove that the element $$5$$ has an order of $$2^{e - 2}$$ in $$\mathbb{Z}_{2^e}^\times$$.
This time, though, we start with $$5 =_{2^3} 1 + 2^2$$,
which means that we have $$H =_{p^3} 1 + p^2$$ for $$p = 2$$ before raising $$H$$ to the power of $$p$$ for the first time.
As a consequence, we lag one exponentiation behind when compared to the previous box,
which is why the order of $$5$$ is $$2^{e-2}$$ instead of $$2^{e-1}$$.
Ignoring this and working it out again,
we get $$5^{2^i} =_{2^{3+i}} 1 + 2^{2+i}$$ when squaring $$5$$ $$i$$ times
according to [this box](#congruence-of-1-plus-prime-power-after-exponentiation).
When $$i = e - 2$$, we have $$5^{2^{e-2}} =_{2^{e+1}} 1 + 2^e =_{2^e} 1$$.
When $$i = e - 3$$, $$5^{2^{e-3}} =_{2^e} 1 + 2^{e-1} ≠_{2^e} 1$$.
[Therefore](#order-of-prime-power), $$|5| = 2^{e-2}$$.

</details>


### Probabilistic primality tests

Let's continue with something different: How do we know whether an integer is [prime](#prime-factorization)?
For small integers, we can use [trial division](#prime-factorization):
Given an integer $$n$$, you can simply try to divide $$n$$ by all possible factors up to $$\sqrt{n}$$.
If you find a factor, $$n$$ is composite.
Otherwise, $$n$$ is prime.
For large integers, trial division becomes infeasible
because it [scales](#computational-complexity-theory) with the square root of $$n$$.
Even though [a deterministic algorithm is known](https://en.wikipedia.org/wiki/AKS_primality_test) to determine
in [polynomial time](https://en.wikipedia.org/wiki/Time_complexity#Polynomial_time) whether an integer is prime,
[probabilistic primality tests](https://en.wikipedia.org/wiki/Primality_test#Probabilistic_tests)
are used in practice because they are much faster and much simpler.

Probabilistic primality tests are based on some condition
which is true for all integers strictly between $$0$$ and $$n$$ if $$n$$ is prime.
If $$n$$ is composite, the condition still holds for some but not all of these integers.
By evaluating the condition/test repeatedly for random candidates from this set of integers,
we will eventually find a candidate for which the condition is false if we keep searching for long enough.
Since this cannot happen if $$n$$ is prime, such a candidate is a so-called
[witness](https://en.wikipedia.org/wiki/Witness_(mathematics)) for the compositeness of $$n$$.
A candidate for which the condition is true even though $$n$$ is composite
is a so-called liar as it lies about the true nature of $$n$$.

<figure markdown="block">
{% include_relative generated/probabilistic-primality-test-terminology.embedded.svg %}
<figcaption markdown="span">
The condition classifies candidates into liars and witnesses.
</figcaption>
</figure>

If we denote the set of integers strictly between $$0$$ and $$n$$ as $$\mathbb{Z}_n^{\cancel{0}}$$,
the set of liars for $$n$$ as $$\mathbb{L}_n$$,
and the set of witnesses for $$n$$ as $$\mathbb{W}_n$$,
we get the following [Venn diagram](https://en.wikipedia.org/wiki/Venn_diagram),
where $$\mathbb{L}_n \cup \mathbb{W}_n = \mathbb{Z}_n^{\cancel{0}}$$
and $$\mathbb{L}_n \cap \mathbb{W}_n = \href{https://en.wikipedia.org/wiki/Empty_set}{\varnothing}$$:

<figure markdown="block">
{% include_relative generated/primality-test-liars-witnesses.embedded.svg %}
<figcaption markdown="span">
The classification visualized as sets.
</figcaption>
</figure>

If $$n$$ is prime, the set of witnesses is empty and the liars aren't lying.
If $$n$$ is composite, the probability that a random candidate $$A \in \mathbb{Z}_n^{\cancel{0}}$$ is a liar
is $$|\mathbb{L}_n| / |\mathbb{Z}_n^{\cancel{0}}|$$.
When we repeat the probabilistic primality test $$t$$ times, the probability that we select $$t$$ liars
and therefore think that $$n$$ is prime even though it isn't is $$(|\mathbb{L}_n| / |\mathbb{Z}_n^{\cancel{0}}|)^t$$.
Since $$|\mathbb{L}_n| / |\mathbb{Z}_n^{\cancel{0}}| < 1$$ if $$n$$ is composite,
we can lower the probability that we err when we declare $$n$$ to be prime to an arbitrarily small number.
Unless we test all possible candidates, which is infeasible when $$n$$ is sufficiently large, we cannot be certain, though.
For this reason, we call an integer which passes many rounds of a probabilistic primality test
only a [probable prime](https://en.wikipedia.org/wiki/Probable_prime),
which is in contrast to a [provable prime](https://en.wikipedia.org/wiki/Provable_prime),
whose primality has been established with certainty.

<figure markdown="block">
{% include_relative generated/probabilistic-primality-test-outcomes.embedded.svg %}
<figcaption markdown="span">
The two possible outcomes of a probabilistic primality test.
</figcaption>
</figure>

In the following, we'll study two probabilistic primality tests:
The [Fermat primality test](#fermat-primality-test)
and the superior and thus preferable [Miller-Rabin primality test](#miller-rabin-primality-test).
When analyzing a probabilistic primality test,
we want to know whether the ratio of liars to all candidates is smaller than some bound for any composite $$n$$.
Since it's difficult to reason about all the integers between $$0$$ and $$n$$,
we'll consider only the integers which are coprime with $$n$$
as they form a [multiplicative group](#multiplicative-groups),
which allows us to use [everything we know about groups](#finite-groups) in our analyses.
Since $$\mathbb{Z}_n^\times \subsetneq \mathbb{Z}_n^{\cancel{0}}$$ if $$n$$ is composite,
it follows that $$|\mathbb{L}_n| / |\mathbb{Z}_n^{\cancel{0}}| \lneq |\mathbb{L}_n| / |\mathbb{Z}_n^\times|$$,
which means that any upper bound which we prove for $$|\mathbb{L}_n| / |\mathbb{Z}_n^\times|$$
also holds for $$|\mathbb{L}_n| / |\mathbb{Z}_n^{\cancel{0}}|$$.
As [we'll see](#carmichael-numbers), all the candidates which aren't coprime with $$n$$
are witnesses for both the Fermat and the Miller-Rabin primality test.
If $$n$$ is the product of large prime numbers, the multiples of these prime factors are so rare
that we cannot rely on finding one of them.

<figure markdown="block">
{% include_relative generated/primality-test-coprime-non-coprime.embedded.svg %}
<figcaption markdown="span" style="max-width: 275px;">

A different classification of the candidates,
where $$|\mathbb{Z}_n^\times| ≤ |\mathbb{Z}_n^{\cancel{0}}| < n$$ and $$\mathbb{L}_n \subseteq \mathbb{Z}_n^\times$$.
<span class="text-nowrap" markdown="span">($$\mathbb{Z}_n^\times = \mathbb{Z}_n^{\cancel{0}}$$</span>
[if and only if](#if-and-only-if) $$n$$ is prime.)

</figcaption>
</figure>


### Fermat primality test

[Fermat's little theorem](#fermats-little-theorem) states that given a [prime](#prime-factorization) $$n$$,
<!-- --> $$A^{n-1} =_n 1$$ for all $$A \in \mathbb{Z}_n^\times$$.
This can be used as the condition for a [probabilistic primality test](#probabilistic-primality-tests),
which is known as the [Fermat primality test](https://en.wikipedia.org/wiki/Fermat_primality_test).
The problem with this test is that there are infinitely many composite integers for which the theorem holds as well.
These integers are called [Carmichael numbers](#carmichael-numbers).
While Carmichael numbers are [rare](#density-of-carmichael-numbers-and-prime-numbers),
they are common enough that you cannot ignore them,
especially in the adversarial context of cryptography.
If a composite integer $$n$$ is not a Carmichael number,
then at least half of all the elements in $$\mathbb{Z}_n^\times$$ are [witnesses](#probabilistic-primality-tests),
which means that $$|\mathbb{L}_n^F| ≤ \frac{1}{2} |\mathbb{Z}_n^\times| < \frac{n}{2}$$.
(The $$F$$ in $$\mathbb{L}_n^F$$ indicates
that we are talking about the [liars](#probabilistic-primality-tests) of the Fermat primality test.)
There are two ways to see why this is the case:
- **Pairing**: There is at least one witness $$W \in \mathbb{W}_n^F$$ as $$n$$ would be a Carmichael number otherwise.
  Since $$\mathbb{Z}_n^\times$$ is a [group](#group-axioms), $$W$$ maps each liar $$L \in \mathbb{L}_n^F$$
  to a [distinct](#unique-result) witness: $$(L \cdot W)^{n-1} =_n L^{n-1} \cdot W^{n-1} =_n W^{n-1} ≠_n 1$$
  ($$L^{n-1} =_n 1$$ by definition).
  Thus, $$|\mathbb{L}_n^F| ≤ |\mathbb{W}_n^F|$$.
- **Subgroup**: $$\mathbb{L}_n^F$$ is a [subgroup](#subgroups) of $$\mathbb{Z}_n^\times$$
  because $$\mathbb{L}_n^F$$ is not empty as $$1 \in \mathbb{L}_n^F$$
  and $$\mathbb{L}_n^F$$ is [closed](#group-axioms)
  as $$(L_1 \cdot L_2)^{n-1} =_n L_1^{n-1} \cdot L_2^{n-1} =_n 1$$ for all $$L_1, L_2 \in \mathbb{L}_n^F$$.
  By [Lagrange's theorem](#lagranges-theorem), $$|\mathbb{L}_n^F| = \frac{1}{c} |\mathbb{Z}_n^\times|$$
  for a $$c \in \mathbb{Z}_{>0}$$.
  As $$n$$ isn't a Carmichael number, $$|\mathbb{L}_n^F| < |\mathbb{Z}_n^\times|$$ and $$c > 1$$.

The following tool implements the Fermat primality test.
You can enter a comma-separated list of candidates that you want to test the input $$n$$ with
and specify the number of rounds which shall be performed with randomly chosen candidates.
See the boxes below for inputs on which the test fails with a high probability,
which is why you should not use the Fermat primality test alone in practice.

<div id="tool-integer-fermat-primality-test"></div>

<details markdown="block">
<summary markdown="span" id="remarks-on-this-tool">
Remarks on this tool
</summary>

- **Input n**: The input $$n$$ has to be odd because the inputs are shared
  with the [Miller-Rabin primality test](#miller-rabin-primality-test),
  which cannot handle even inputs.
  (For even inputs, the candidate 2 is always a witness as we'll see in the [next box](#carmichael-numbers).)
- **Seed**: As many candidates as indicated by the "Rounds" slider
  are generated [pseudo-randomly](https://en.wikipedia.org/wiki/Pseudorandomness)
  from the given [seed](https://en.wikipedia.org/wiki/Random_seed).
  This allows you to [revisit earlier candidates](/#interactive-tools)
  and [share interesting outputs](/#sharing-of-values) with others.
  Another benefit is that you get a new set of candidates simply by changing the seed,
  such as by clicking on the "Increment" button.
  If you implement a [probabilistic primality test](#probabilistic-primality-tests) yourself, there's no reason
  to use a [pseudo-random number generator (PRNG)](https://en.wikipedia.org/wiki/Pseudorandom_number_generator) like I did.
  In particular, using a known seed is [dangerous in an adversarial setting](https://eprint.iacr.org/2018/749.pdf).
  (The [design choice](https://en.wikipedia.org/wiki/Design_choice) of generating candidates deterministically
  also made it easy to use the same candidates
  in the [tool of the Miller-Rabin primality test](#tool-integer-miller-rabin-primality-test) below.)
- **Abort**: If you want to find liars for a particular input,
  you don't want the tool to stop after encountering a witness.
  This is why the tool allows you to [disable the "Abort"](#tool-integer-miller-rabin-primality-test&abort=false),
  which you wouldn't do if you care only about whether the input is [probably prime](#probabilistic-primality-tests).

</details>

<details markdown="block">
<summary markdown="span" id="carmichael-numbers">
Carmichael numbers
</summary>

A [composite integer](#prime-factorization) $$n$$ is a [Carmichael number](https://en.wikipedia.org/wiki/Carmichael_number)
[if and only if](#if-and-only-if) [Carmichael's totient function $$\lambda(n)$$](#carmichaels-totient-function)
divides $$n - 1$$.
If this is the case, then $$A^{n-1} =_n A^{\lambda(n) \cdot c} =_n 1^c =_n 1$$
for all $$A$$ which are [coprime](#multiset-of-prime-factors) with $$n$$ and some integer $$c$$.
These numbers are also named after
[Robert Daniel Carmichael](https://en.wikipedia.org/wiki/Robert_Daniel_Carmichael) (1879 − 1967).
The [Fermat primality test](#fermat-primality-test) fails to detect Carmichael numbers as composite
only if all the chosen candidates are coprime with the number which is being tested.
If a candidate $$A$$ is not coprime with the integer $$n$$,
<!-- --> $$A$$ has [no multiplicative inverse](#multiplicative-inverse-revisited),
and the [closest you can get](#bezouts-identity) to a multiple of $$n$$
is $$\operatorname{\href{#greatest-common-divisor}{gcd}}(A, n)$$.
In other words, if $$\operatorname{gcd}(A, n) > 1$$, then $$A^{n-1} ≠_n 1$$.
Thus, $$\mathbb{L}_n^F = \mathbb{Z}_n^\times$$.
If you use the first dozen prime numbers as candidates,
which the [tool above](#tool-integer-fermat-primality-test) does by default,
the Fermat primality test fails for only 2 out of the first 33 Carmichael numbers
as given by [this list](https://oeis.org/A002997) from the
[On-Line Encyclopedia of Integer Sequences (OEIS)](https://en.wikipedia.org/wiki/On-Line_Encyclopedia_of_Integer_Sequences):
[252'601](#tool-integer-fermat-primality-test&input=252%27601&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29%2C+31%2C+37&rounds=0) = [41 · 61 · 101](#tool-integer-factorization-trial-division&integer=252%27601) and
[410'041](#tool-integer-fermat-primality-test&input=410%27041&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29%2C+31%2C+37&rounds=0) = [41 · 73 · 137](#tool-integer-factorization-trial-division&integer=410%27041).
All the other numbers on the list have a factor smaller than 41.
As we will see in the [next box](#chernicks-carmichael-numbers),
there's a formula to obtain Carmichael numbers which don't have a small factor.

<figure markdown="block">
{% include_relative generated/primality-test-carmichael-number.embedded.svg %}
<figcaption markdown="span" style="max-width: 260px;">
How the Fermat primality test classifies the candidates of a Carmichael number.
</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="chernicks-carmichael-numbers">
Chernick's Carmichael numbers
</summary>

If you find an integer $$k$$ so that $$6k + 1$$, $$12k + 1$$, and $$18k + 1$$ are prime,
then $$n = (6k + 1)(12k + 1)(18k + 1)$$ is a [Carmichael number](#carmichael-numbers)
since $$\href{#carmichaels-totient-function}{\lambda}(n)
= \operatorname{\href{#least-common-multiple}{lcm}}(6k, 12k, 18k) = 36k$$
divides $$n - 1 = 1296k^3 + 396k^2 + 36k$$.
($$1296 / 36 = 36$$ and $$396 / 36 = 11$$.)
The small subset of Carmichael numbers which are of this form are called
[Chernick's Carmichael numbers](https://en.wikipedia.org/wiki/Carmichael_number#Discovery),
named after Jack Chernick (1911 − 1971), who lacks an entry on [Wikipedia](https://en.wikipedia.org/wiki/Main_Page).
As we learned in the [previous box](#carmichael-numbers),
the [Fermat primality test](#fermat-primality-test) detects the compositeness of a Carmichael number
only if one of the tested candidates is a multiple of one of its prime factors.
The probability that a random candidate is a [liar](#probabilistic-primality-tests),
and we thus fail to detect the compositeness of the Carmichael number $$n$$ in any particular round,
is $$\frac{|\mathbb{L}_n^F|}{|\mathbb{Z}_n^{\cancel{0}}|} = \frac{\href{#eulers-totient-function}{\varphi}(n)}{n-1}$$.
Since each round is independent from the others,
the [failure rate](https://en.wikipedia.org/wiki/Failure_rate) after 100 rounds
is $$\big(\frac{\varphi(n)}{n-1}\big)^{100}$$.

<figure markdown="block" class="allow-break-inside">

| k | Carmichael number | Prime factorization | Failure rate per round | Failure rate after 100 rounds
|-:|-:|-:|-:|-:
| 1 | [1'729](#tool-integer-fermat-primality-test&input=1%27729&candidates=&rounds=100) | [7 · 13 · 19](#tool-integer-factorization-trial-division&integer=1%27729) | 0.7500 | 0.0000
| 6 | [294'409](#tool-integer-fermat-primality-test&input=294%27409&candidates=&rounds=100) | [37 · 73 · 109](#tool-integer-factorization-trial-division&integer=294%27409) | 0.9508 | 0.0065
| 35 | [56'052'361](#tool-integer-fermat-primality-test&input=56%27052%27361&candidates=&rounds=100) | [211 · 421 · 631](#tool-integer-factorization-trial-division&integer=56%27052%27361) | 0.9913 | 0.4183
| 45 | [118'901'521](#tool-integer-fermat-primality-test&input=118%27901%27521&candidates=&rounds=100) | [271 · 541 · 811](#tool-integer-factorization-trial-division&integer=118%27901%27521) | 0.9932 | 0.5076
| 51 | [172'947'529](#tool-integer-fermat-primality-test&input=172%27947%27529&candidates=&rounds=100) | [307 · 613 · 919](#tool-integer-factorization-trial-division&integer=172%27947%27529) | 0.9940 | 0.5497
| 55 | [216'821'881](#tool-integer-fermat-primality-test&input=216%27821%27881&candidates=&rounds=100) | [331 · 661 · 991](#tool-integer-factorization-trial-division&integer=216%27821%27881) | 0.9945 | 0.5741
| 56 | [228'842'209](#tool-integer-fermat-primality-test&input=228%27842%27209&candidates=&rounds=100) | [337 · 673 · 1'009](#tool-integer-factorization-trial-division&integer=228%27842%27209) | 0.9946 | 0.5798
| 100 | [1'299'963'601](#tool-integer-fermat-primality-test&input=1%27299%27963%27601&candidates=&rounds=100) | [601 · 1'201 · 1'801](#tool-integer-factorization-trial-division&integer=1%27299%27963%27601) | 0.9970 | 0.7369
| … | … | … | … | …
| 511 | [173'032'371'289](#tool-integer-fermat-primality-test&input=173%27032%27371%27289&candidates=&rounds=100) | [3'067 · 6'133 · 9'199](#tool-integer-factorization-trial-division&integer=173%27032%27371%27289) | 0.9994 | 0.9420
| 710 | [464'052'305'161](#tool-integer-fermat-primality-test&input=464%27052%27305%27161&candidates=&rounds=100) | [4'261 · 8'521 · 12'781](#tool-integer-factorization-trial-division&integer=464%27052%27305%27161) | 0.9996 | 0.9579

<figcaption markdown="span">

The first Chernick's Carmichael numbers according to [this list](https://oeis.org/A033502) from the
[On-Line Encyclopedia of Integer Sequences (OEIS)](https://en.wikipedia.org/wiki/On-Line_Encyclopedia_of_Integer_Sequences).

</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="carmichael-numbers-are-a-product-of-at-least-three-distinct-primes">
Carmichael numbers are a product of at least three distinct primes
</summary>

It is no coincidence that [Chernick's formula for Carmichael numbers](#chernicks-carmichael-numbers)
is a product of three prime numbers.
In this box we'll show that every [Carmichael number](#carmichael-numbers)
is a product of at least three distinct primes.
Let $$n = p_1^{e_1} \cdot … \cdot p_l^{e_l}$$
be the [prime factorization](#prime-factorization) of an arbitrary Carmichael number.
This factorization has the following four properties
(see page 308 in [Victor Shoup's book](https://shoup.net/ntb/ntb-v2.pdf)):
1. $$n$$ is odd, i.e. $$p_i ≠ 2$$ for all $$i \in \{1, …, l\}$$:
   If $$n$$ was even, $$n - 1$$ would be odd
   and the coprime element $$-1 =_n n - 1$$ would be a [witness](#probabilistic-primality-tests)
   because $$-1^d =_n -1 ≠_n 1$$ for any odd integer $$d$$.
   Since $$n$$ is a Carmichael number, this cannot be the case.
2. $$e_i = 1$$ for every $$i \in \{1, …, l\}$$:
   The [composite group](#composite-groups) $$\mathbb{Z}_n^\times$$ is [isomorphic](#group-isomorphisms)
   to the [direct product](#direct-product) of $$\mathbb{Z}_{p_1^{e_1}}^\times, …, \mathbb{Z}_{p_l^{e_l}}^\times$$.
   Since $$n$$ is a Carmichael number, $$A^{n-1} =_n 1$$ for every $$A \in \mathbb{Z}_n^\times$$.
   Since the isomorphism maps $$1 \in \mathbb{Z}_n^\times$$
   to $$(1, …, 1) \in \mathbb{Z}_{p_1^{e_1}}^\times \times … \times \mathbb{Z}_{p_l^{e_l}}^\times$$,
   it has to be the case that $$A^{n-1} =_{p_i^{e_i}} 1$$ for every $$A \in \mathbb{Z}_{p_i^{e_i}}^\times$$.
   Since $$p_i$$ is odd according to the previous point,
   [$$\mathbb{Z}_{p_i^{e_i}}^\times$$ is cyclic](#why-multiplicative-groups-modulo-a-power-of-an-odd-prime-are-cyclic),
   and thus $$n - 1$$ has to be a multiple of $$|\mathbb{Z}_{p_i^{e_i}}^\times|
   = \href{#eulers-totient-function}{\varphi}(p_i^{e_i}) = p_i^{e_i-1} (p_i - 1)$$.
   With $$e_i > 1$$, $$p_i^{e_i-1} (p_i - 1)$$ would be a multiple of $$p_i$$
   and thus $$n - 1$$ would also be a multiple of $$p_i$$.
   However, given that $$p_i$$ is a factor of $$n$$, $$e_i$$ has to be $$1$$
   because $$n$$ and $$n - 1$$ cannot both be multiples of $$p_i$$.
3. $$p_i - 1$$ divides $$n - 1$$ for all $$i \in \{1, …, l\}$$:
   I explained in the previous point why $$n - 1$$ has to be a multiple of $$p_i^{e_i-1} (p_i - 1)$$.
   Now that we know that $$e_i = 1$$, it follows that $$n - 1$$ is a multiple of $$p_i - 1$$.
4. $$l ≥ 3$$: By definition, $$n$$ has to be composite and thus $$l > 1$$.
   Suppose $$l = 2$$, which means that $$n$$ is the product of two primes.
   According to the previous point, $$p_1 - 1$$ divides $$n - 1$$.
   Given that $$n - 1 = p_1 p_2 - 1 = (p_1 - 1) p_2 + (p_2 - 1)$$,
   <!-- --> $$p_1 - 1$$ has to divide $$p_2 - 1$$.
   ($$a \cdot b + c$$ can be a multiple of $$a$$ only if $$c$$ is a multiple of $$a$$.)
   By a symmetric argument, $$p_2 - 1$$ has to divide $$p_1 - 1$$.
   However, two integers can be multiples of each other only if they are the same.
   Since our notation for the prime factorization requires the factors to be distinct,
   <!-- --> $$p_1$$ cannot equal $$p_2$$.
   Hence, $$n$$ is the product of at least three distinct primes.

The second and the third point are [sufficient](https://en.wikipedia.org/wiki/Necessity_and_sufficiency#Sufficiency)
for $$n$$ to be a Carmichael number because they ensure
that $$\href{#carmichaels-totient-function}{\lambda}(n)$$ divides $$n - 1$$
as required by [our definition](#carmichael-numbers).
This is known as [Korselt's criterion](https://en.wikipedia.org/wiki/Carmichael_number#Korselt's_criterion),
named after [Alwin Reinhold Korselt](https://en.wikipedia.org/wiki/Alwin_Korselt) (1864 − 1947).

</details>

<details markdown="block">
<summary markdown="span" id="density-of-carmichael-numbers-and-prime-numbers">
Density of Carmichael numbers and prime numbers
</summary>

For a sufficiently large integer $$x$$,
there are [at least $$x^{1/3}$$](https://en.wikipedia.org/wiki/Carmichael_number#Distribution)
[Carmichael numbers](#carmichael-numbers) smaller than $$x$$.
On the other hand, the number of primes smaller than $$x$$ is
[approximately $$\frac{x}{\log_\mathrm{e}(x)}$$](https://en.wikipedia.org/wiki/Prime-counting_function),
where $$\log_\mathrm{e}(x)$$ is the [natural logarithm](https://en.wikipedia.org/wiki/Natural_logarithm) of $$x$$.
To give you an idea for how much rarer Carmichael numbers are than prime numbers:
There are 2'220'819'602'560'918'840 ≈ 2 · 10<sup>18</sup> prime numbers
and only 8'220'777 ≈ 8 · 10<sup>6</sup> Carmichael numbers
below 100'000'000'000'000'000'000 = 10<sup>20</sup>.

</details>

<details markdown="block">
<summary markdown="span" id="integers-for-which-half-of-all-coprime-elements-are-fermat-liars">
Integers for which half of all coprime elements are Fermat liars
</summary>

As we saw [above](#fermat-primality-test), the Fermat liars $$\mathbb{L}_n^F$$
form a [subgroup](#subgroups) of the coprime elements $$\mathbb{Z}_n^\times$$ for all integers $$n$$ greater than $$1$$.
Due to [Lagrange's theorem](#lagranges-theorem), $$|\mathbb{Z}_n^\times| / |\mathbb{L}_n^F|$$ is an integer.
This ratio is known as the [index of the subgroup](#index-and-cofactor).
If the index of $$\mathbb{L}_n^F$$ is $$1$$ and $$n$$ is composite, $$n$$ is a [Carmichael number](#carmichael-numbers).
If a composite $$n$$ is not a Carmichael number, the index of $$\mathbb{L}_n^F$$ has to be at least $$2$$.
There are integers for which half of all coprime elements are liars in the [Fermat primality test](#fermat-primality-test):

<figure markdown="block" class="allow-break-inside">

| n | Prime factorization | Number of liars | Ratio of liars<br>to all candidates
|-:|-:|-:|-:
| [15](#tool-integer-fermat-primality-test&input=15&candidates=&rounds=100&abort=false) | [3 · 5](#tool-integer-factorization-trial-division&integer=15) | 4 | 0.2857
| [91](#tool-integer-fermat-primality-test&input=91&candidates=&rounds=100&abort=false) | [7 · 13](#tool-integer-factorization-trial-division&integer=91) | 36 | 0.4000
| [703](#tool-integer-fermat-primality-test&input=703&candidates=&rounds=100&abort=false) | [19 · 37](#tool-integer-factorization-trial-division&integer=703) | 324 | 0.4615
| [1'891](#tool-integer-fermat-primality-test&input=1%27891&candidates=&rounds=100&abort=false) | [31 · 61](#tool-integer-factorization-trial-division&integer=1%27891) | 900 | 0.4762
| [2'701](#tool-integer-fermat-primality-test&input=2%27701&candidates=&rounds=100&abort=false) | [37 · 73](#tool-integer-factorization-trial-division&integer=2%27701) | 1'296 | 0.4800
| [11'305](#tool-integer-fermat-primality-test&input=11%27305&candidates=&rounds=100&abort=false) | [5 · 7 · 17 · 19](#tool-integer-factorization-trial-division&integer=11%27305) | 3'456 | 0.3057
| [12'403](#tool-integer-fermat-primality-test&input=12%27403&candidates=&rounds=100&abort=false) | [79 · 157](#tool-integer-factorization-trial-division&integer=12%27403) | 6'084 | 0.4906
| [13'981](#tool-integer-fermat-primality-test&input=13%27981&candidates=&rounds=100&abort=false) | [11 · 31 · 41](#tool-integer-factorization-trial-division&integer=13%27981) | 6'000 | 0.4292
| … | … | … | …

<figcaption markdown="span">

The odd integers for which $$\frac{|\mathbb{L}_n^F|}{|\mathbb{Z}_n^\times|} = \frac{1}{2}$$
according to [this list](https://oeis.org/A191311) from the
[On-Line Encyclopedia of Integer Sequences (OEIS)](https://en.wikipedia.org/wiki/On-Line_Encyclopedia_of_Integer_Sequences).

</figcaption>
</figure>

If we want the ratio of Fermat liars to all candidates (i.e. $$|\mathbb{L}_n^F| / |\mathbb{Z}_n^{\cancel{0}}|$$)
to be as close to 0.5 as possible,
we're interested in those integers which are the product of just two primes.
Such integers are known as [semiprimes](https://en.wikipedia.org/wiki/Semiprime).
(The more primes there are in the [prime factorization](#prime-factorization) of $$n$$,
the smaller $$\frac{\href{#eulers-totient-function}{\varphi}(n)/2}{n-1}$$ becomes.)
It turns out that the semiprimes in the above list are of the form $$n = p \cdot q \textsf{,}$$
where $$p$$ and $$q$$ are prime and $$q = 2p - 1$$.
The beginning of the list is the same, and we approach 0.5 for larger values of $$n$$:

<figure markdown="block" class="allow-break-inside">

| n | Prime factorization | Number of liars | Ratio of liars<br>to all candidates
|-:|-:|-:|-:
| … | … | … | …
| [2'701](#tool-integer-fermat-primality-test&input=2%27701&candidates=&rounds=100&abort=false) | [37 · 73](#tool-integer-factorization-trial-division&integer=2%27701) | 1'296 | 0.4800
| [12'403](#tool-integer-fermat-primality-test&input=12%27403&candidates=&rounds=100&abort=false) | [79 · 157](#tool-integer-factorization-trial-division&integer=12%27403) | 6'084 | 0.4906
| [18'721](#tool-integer-fermat-primality-test&input=18%27721&candidates=&rounds=100&abort=false) | [97 · 193](#tool-integer-factorization-trial-division&integer=18%27721) | 9'216 | 0.4923
| [38'503](#tool-integer-fermat-primality-test&input=38%27503&candidates=&rounds=100&abort=false) | [139 · 277](#tool-integer-factorization-trial-division&integer=38%27503) | 19'044 | 0.4946
| [49'141](#tool-integer-fermat-primality-test&input=49%27141&candidates=&rounds=100&abort=false) | [157 · 313](#tool-integer-factorization-trial-division&integer=49%27141) | 24'336 | 0.4952
| [79'003](#tool-integer-fermat-primality-test&input=79%27003&candidates=&rounds=100&abort=false) | [199 · 397](#tool-integer-factorization-trial-division&integer=79%27003) | 39'204 | 0.4962
| … | … | … | …
| [1'373'653](#tool-integer-fermat-primality-test&input=1%27373%27653&candidates=&rounds=100&abort=false) | [829 · 1'657](#tool-integer-factorization-trial-division&integer=1%27373%27653) | 685'584 | 0.4991
| [1'537'381](#tool-integer-fermat-primality-test&input=1%27537%27381&candidates=&rounds=100&abort=false) | [877 · 1'753](#tool-integer-factorization-trial-division&integer=1%27537%27381) | 767'376 | 0.4991

<figcaption markdown="span">

The semiprimes $$n = p \cdot q$$ so that $$q = 2p - 1$$ according to [this list](https://oeis.org/A129521) from the
[On-Line Encyclopedia of Integer Sequences (OEIS)](https://en.wikipedia.org/wiki/On-Line_Encyclopedia_of_Integer_Sequences).

</figcaption>
</figure>

Therefore, 0.5 is indeed the best bound for the ratio of Fermat liars to all candidates of composite non-Carmichael numbers.

</details>


### Miller-Rabin primality test

We can improve upon the [Fermat primality test](#fermat-primality-test) by making the condition in our test stricter:
When computing $$A^{n-1} =_n 1$$ with the [square-and-multiply algorithm](#fast-repetitions),
we can require that whenever you reach $$1$$ by [squaring](https://en.wikipedia.org/wiki/Square_(algebra)) some number,
this number must be either $$1$$ or $$-1$$.
Given our knowledge, we have three ways to see why $$1$$ and $$-1$$
are the only possible [square roots](https://en.wikipedia.org/wiki/Square_root) of $$1$$ in $$\mathbb{Z}_n^\times$$
if $$n$$ is [prime](#prime-factorization):
- **Euclid's lemma**:
  We want to find the possible solutions for $$x$$ in $$x^2 =_n 1$$.
  By taking the $$1$$ to the left side, we get $$x^2 - 1 =_n 0$$,
  which we can refactor into $$(x - 1)(x + 1) =_n 0$$.
  Since the product of $$x - 1$$ and $$x + 1$$ is a multiple of the prime $$n$$,
  <!-- --> $$x - 1$$ or $$x + 1$$ has to be a multiple of $$n$$ according to [Euclid's lemma](#euclids-lemma).
  If $$x - 1$$ is a multiple of $$n$$, then $$x =_n 1$$.
  If not, then $$x$$ has to equal $$-1$$.
- **Cyclic group**:
  Since $$n$$ is prime, [$$\mathbb{Z}_n^\times$$ is cyclic](#why-multiplicative-groups-modulo-a-prime-are-cyclic).
  As I argued [earlier](#multiplicative-group-repetition-table),
  there can be only a single element half-way through the cycle.
- **Polynomial**:
  Even though this is not officially part of our toolkit yet,
  I mentioned [earlier](#why-multiplicative-groups-modulo-a-prime-are-cyclic)
  that $$\mathbb{Z}_n$$ is a [finite field](#finite-fields) if $$n$$ is prime
  and that a [polynomial](https://en.wikipedia.org/wiki/Polynomial) over a field
  can have no more [roots](https://en.wikipedia.org/wiki/Zero_of_a_function)
  than its [degree](https://en.wikipedia.org/wiki/Degree_of_a_polynomial).
  Therefore, the polynomial $$f(x) = x^2 - 1$$ can evaluate to $$0$$ for at most two distinct $$x$$,
  which are $$1$$ and $$-1$$.

After checking that $$n$$ is odd, we know that $$n - 1$$ is even.
(If you want to be able to handle the case where $$n = 2$$, you have to handle it explicitly
with a separate [conditional](https://en.wikipedia.org/wiki/Conditional_(computer_programming)).)
Since $$A^{n-1} =_n 1$$ for all $$A \in \mathbb{Z}_n^\times$$ by [Fermat's little theorem](#fermats-little-theorem),
<!-- --> $$A^{\frac{n-1}{2}}$$ has to equal either $$1$$ or $$-1$$ up to a multiple of $$n$$ if $$n$$ is prime.
If this is not the case, we know for sure that $$n$$ is composite.
If $$A^{\frac{n-1}{2}} =_n 1$$ and $$\frac{n-1}{2}$$ is still even,
we can continue the process with $$A^{\frac{n-1}{4}}$$ and so on.
Instead of calculating such large exponentiations repeatedly,
we write $$n - 1$$ as $$2^cd$$ with an integer $$c ≥ 1$$ and an odd integer $$d$$.
For a candidate $$A$$, we calculate $$A^d \text{ \href{#modulo-operation}{mod} } n$$.
If the result is $$1$$, we can continue with the next candidate because the result remains $$1$$
when we square it repeatedly until we arrive at $$(A^d)^{2^c} =_n A^{n-1} =_n 1$$.
If the result is $$-1$$, we can also continue with the next candidate
because we get $$1$$ after squaring the result once.
For any other result, we square the result and check what we have then.
If the new result is $$1$$, we know that $$n$$ is composite
because the previous result was neither $$1$$ nor $$-1$$.
If the new result is $$-1$$, we can continue with the next candidate
because we're certain that $$A^{n-1}$$ will be $$1$$.
If necessary, we square the first result (i.e. $$A^d$$) $$c - 1$$ times.
If we still haven't got $$-1$$ at this point, we know that $$n$$ is composite
because even if we would get $$1$$ at $$A^{n-1}$$ when squaring $$A^{\frac{n-1}{2}}$$ one more time,
we would arrive from a number other than $$-1$$ or $$1$$.

This [algorithm](https://en.wikipedia.org/wiki/Algorithm) is known as the
[Miller-Rabin primality test](https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test),
named after [Gary Lee Miller](https://en.wikipedia.org/wiki/Gary_Miller_(computer_scientist))
(I couldn't figure out when this gentleman was born)
and [Michael Oser Rabin](https://en.wikipedia.org/wiki/Michael_O._Rabin) (born in 1931).
As for any [probabilistic primality test](#probabilistic-primality-tests), liars still exist.
(If there were no liars, the test wouldn't be probabilistic and we wouldn't have to check more than one candidate.)
Unlike the [Fermat primality test](#fermat-primality-test), however,
<!-- --> $$|\mathbb{L}_n^{MR}| / |\mathbb{Z}_n^{\cancel{0}}| ≤ \frac{1}{4}$$ for any odd composite $$n$$
as we will [prove](#power-function-and-its-preimage) [below](#monier-rabin-bound-on-the-number-of-liars).
Any Miller-Rabin liar is also a Fermat liar (i.e. $$\mathbb{L}_n^{MR} \subseteq \mathbb{L}_n^{F}$$),
so for any candidates for which the Miller-Rabin primality test fails,
the Fermat primality test fails as well.
Given that the Miller-Rabin primality test doesn't struggle with [Carmichael numbers](#carmichael-numbers),
that it has a smaller bound for the ratio of liars to all candidates than the Fermat primality test
($$\frac{1}{4}$$ instead of $$\frac{1}{2}$$, which the latter achieves only for non-Carmichael numbers),
and that it computes fewer squares per round than the Fermat primality test,
the Miller-Rabin primality test is strictly preferable to the Fermat primality test.

The following tool implements the Miller-Rabin primality test.
Its input is synchronized with the [Fermat primality test](#tool-integer-fermat-primality-test) above
so that you can compare the outputs of the two tests.
(This is best done on [this separate page](/number-theory/tools/#fermat-primality-test),
which includes only the tools of this article.)
Since $$1$$ and $$n - 1$$ are always liars,
this tool samples the random candidates between these two values.
For this reason, the smallest integer that you can test is $$5$$.
You can use the [up and down arrows](https://en.wikipedia.org/wiki/Arrow_keys)
on your keyboard to step through the odd inputs
when the [cursor](https://en.wikipedia.org/wiki/Cursor_(user_interface)) is in the field of the input $$n$$.
The tool displays $$-1$$ only for your convenience.
When you calculate [modulo $$n$$](#modulo-operation), you get $$n - 1$$, of course.

<div id="tool-integer-miller-rabin-primality-test"></div>

<details markdown="block">
<summary markdown="span" id="small-prime-numbers-as-candidates">
Small prime numbers as candidates
</summary>

It turns out that the first $$l$$ prime numbers form excellent candidates
for the [Miller-Rabin primality test](#miller-rabin-primality-test):

<figure markdown="block" class="allow-break-inside">

| l | Candidates | Smallest composite integer for which the test fails
|-:|:-|-:
| 1 | [2](#tool-integer-miller-rabin-primality-test&candidates=2) | [2'047](#tool-integer-miller-rabin-primality-test&input=2%27047&candidates=2&rounds=0) > 2<sup>10</sup>
| 2 | [2, 3](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3) | [1'373'653](#tool-integer-miller-rabin-primality-test&input=1%27373%27653&candidates=2%2C+3&rounds=0) > 2<sup>20</sup>
| 3 | [2, 3, 5](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5) | [25'326'001](#tool-integer-miller-rabin-primality-test&input=25%27326%27001&candidates=2%2C+3%2C+5&rounds=0) > 2<sup>24</sup>
| 4 | [2, 3, 5, 7](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7) | [3'215'031'751](#tool-integer-miller-rabin-primality-test&input=3%27215%27031%27751&candidates=2%2C+3%2C+5%2C+7&rounds=0) > 2<sup>31</sup>
| 5 | [2, 3, 5, 7, 11](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11) | [2'152'302'898'747](#tool-integer-miller-rabin-primality-test&input=2%27152%27302%27898%27747&candidates=2%2C+3%2C+5%2C+7%2C+11&rounds=0) > 2<sup>40</sup>
| 6 | [2, 3, 5, 7, 11, 13](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13) | [3'474'749'660'383](#tool-integer-miller-rabin-primality-test&input=3%27474%27749%27660%27383&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13&rounds=0) > 2<sup>41</sup>
| 7 | [2, 3, 5, 7, 11, 13, 17](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17) | [341'550'071'728'321](#tool-integer-miller-rabin-primality-test&input=341%27550%27071%27728%27321&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17&rounds=0) > 2<sup>48</sup>
| 8 | [2, 3, 5, 7, 11, 13, 17, 19](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19) | [341'550'071'728'321](#tool-integer-miller-rabin-primality-test&input=341%27550%27071%27728%27321&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19&rounds=0) > 2<sup>48</sup>
| 9 | [2, 3, 5, 7, 11, 13, 17, 19, 23](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23) | [3'825'123'056'546'413'051](#tool-integer-miller-rabin-primality-test&input=3%27825%27123%27056%27546%27413%27051&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23&rounds=0) > 2<sup>61</sup>
| 10 | [2, 3, 5, 7, 11, 13, 17, 19, 23, 29](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29) | [3'825'123'056'546'413'051](#tool-integer-miller-rabin-primality-test&input=3%27825%27123%27056%27546%27413%27051&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29&rounds=0) > 2<sup>61</sup>
| 11 | [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29%2C+31) | [3'825'123'056'546'413'051](#tool-integer-miller-rabin-primality-test&input=3%27825%27123%27056%27546%27413%27051&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29%2C+31&rounds=0) > 2<sup>61</sup>
| 12 | [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29%2C+31%2C+37) | [318'665'857'834'031'151'167'461](#tool-integer-miller-rabin-primality-test&input=318%27665%27857%27834%27031%27151%27167%27461&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29%2C+31%2C+37&rounds=0) > 2<sup>78</sup>
| 13 | [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41](#tool-integer-miller-rabin-primality-test&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29%2C+31%2C+37%2C+41) | [3'317'044'064'679'887'385'961'981](#tool-integer-miller-rabin-primality-test&input=3%27317%27044%27064%27679%27887%27385%27961%27981&candidates=2%2C+3%2C+5%2C+7%2C+11%2C+13%2C+17%2C+19%2C+23%2C+29%2C+31%2C+37%2C+41&rounds=0) > 2<sup>81</sup>

<figcaption markdown="span">

The smallest integers for which the first $$l$$ prime numbers are not enough to detect their compositeness<br>
according to [this list](https://oeis.org/A014233) from the
[On-Line Encyclopedia of Integer Sequences (OEIS)](https://en.wikipedia.org/wiki/On-Line_Encyclopedia_of_Integer_Sequences).

</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="power-function-and-its-preimage">
Power function and its preimage
</summary>

The [function](https://en.wikipedia.org/wiki/Function_(mathematics)) $$f_y(X) =_n X^y$$
computes the $$y$$<sup>th</sup> [power](https://en.wikipedia.org/wiki/Exponentiation#Power_functions)
of any element $$X$$ of the [multiplicative group](#multiplicative-groups) $$\mathbb{Z}_n^\times$$.
For any [subset](https://en.wikipedia.org/wiki/Subset) $$\mathbb{S} \subseteq \mathbb{Z}_n^\times$$,
we denote the so-called [preimage](https://en.wikipedia.org/wiki/Image_(mathematics)#Inverse_image)
of $$\mathbb{S}$$ under $$f_y$$ as $$f_y^{-1}(\mathbb{S}) = \{X \in \mathbb{Z}_n^\times \mid f_y(X) \in \mathbb{S}\}$$.
(As we will revisit [later](#kernel), $$f_y^{-1}(\{1\})$$ is the so-called
[kernel](https://en.wikipedia.org/wiki/Kernel_(algebra)) of $$f_y$$.)
We need the following property in order to prove
the [Monier-Rabin bound on the number of liars](#monier-rabin-bound-on-the-number-of-liars):
If $$\mathbb{Z}_n^\times$$ is [cyclic](#cyclic-groups), $$|f_y^{-1}(\{1\})|
= \operatorname{\href{#greatest-common-divisor}{gcd}}(y, \href{#eulers-totient-function}{\varphi}(n))$$.
Proof: Let $$G$$ be a [generator](#group-generators) of the cyclic group,
then for any $$X \in \mathbb{Z}_n^\times$$, there's an integer $$x$$ so that $$X =_n G^x$$.
We want to determine the number of $$X \in \mathbb{Z}_n^\times$$ for which $$X^y =_n (G^x)^y =_n 1$$.
Now $$G^z$$ can equal $$1$$ only if $$z$$ is a multiple of $$\lvert G \rvert = \varphi(n)$$.
How many $$x \in \mathbb{Z}_{\varphi(n)}$$ are there so that $$x \cdot y =_{\varphi(n)} 0$$?
As we saw [earlier](#least-common-multiple-and-0), the answer is $$\operatorname{gcd}(y, \varphi(n))$$.

</details>

<details markdown="block">
<summary markdown="span" id="monier-rabin-bound-on-the-number-of-liars">
Monier-Rabin bound on the number of liars
</summary>

[Louis Monier](https://en.wikipedia.org/wiki/Louis_Monier) (born in 1956) and
[Michael Oser Rabin](https://en.wikipedia.org/wiki/Michael_O._Rabin) (born in 1931) proved independently in 1980
that $$|\mathbb{L}_n^{MR}| / |\mathbb{Z}_n^{\cancel{0}}| ≤ \frac{1}{4}$$ for any odd composite integer $$n$$.
As a consequence, the probability that an odd composite integer $$n$$ is mislabeled
as a [probable prime](#probabilistic-primality-tests) after $$t$$ rounds
of the [Miller-Rabin primality test](#miller-rabin-primality-test) with random candidates is at most $$(\frac{1}{4})^t$$.
I adapted the following proof from page 309 of [Victor Shoup's book](https://shoup.net/ntb/ntb-v2.pdf).
You find similar approaches [here](https://kconrad.math.uconn.edu/blurbs/ugradnumthy/millerrabin.pdf)
and [here](https://www.cis.upenn.edu/~jean/RSA-primality-testing.pdf)
in case you cannot follow my explanations.

After checking that $$n$$ is odd and aborting the Miller-Rabin primality test otherwise, there are two cases to consider:
1. $$n = p^e$$ for some odd prime $$p$$ and an integer $$e > 1$$:
   Since every Miller-Rabin liar is also a Fermat liar
   (i.e. $$\mathbb{L}_n^{MR} \subseteq \mathbb{L}_n^{F}$$),
   any upper bound on the latter also applies to the former
   (i.e. if $$|\mathbb{L}_n^{F}| ≤ \frac{n-1}{4}$$, then $$|\mathbb{L}_n^{MR}| ≤ \frac{n-1}{4}$$).
   An element $$L \in \mathbb{Z}_n^\times$$ is a Fermat liar [if and only if](#if-and-only-if) $$L^{n-1} =_n 1$$.
   Since [multiplicative groups modulo a power of an odd prime are cyclic](#why-multiplicative-groups-modulo-a-power-of-an-odd-prime-are-cyclic),
   there are $$|f_{n-1}^{-1}(\{1\})| \allowbreak
   = \operatorname{\href{#greatest-common-divisor}{gcd}}(n - 1, \href{#eulers-totient-function}{\varphi}(n))$$
   Fermat liars in $$\mathbb{Z}_n^\times$$ according to the [previous box](#power-function-and-its-preimage).
   Using the definitions of [Euler's totient function $$\varphi$$](#eulers-totient-function) and $$n$$,
   we get $$\operatorname{gcd}(p^e - 1, p^{e-1}(p - 1))$$.
   Clearly, $$p - 1$$ divides $$p^{e-1}(p - 1)$$.
   Since $$(p - 1) \sum_{i=0}^{e-1} p^i \allowbreak
   = \big(\sum_{i=1}^e p^i\big) - \big(\sum_{i=0}^{e-1} p^i\big) \allowbreak = p^e - 1$$,
   <!-- --> $$p - 1$$ divides also $$p^e - 1$$.
   (It's obvious when putting it as $$(m+1)^e =_m 1$$ for $$m = p - 1$$.)
   Since $$\sum_{i=0}^{e-1} p^i$$ is not a multiple of $$p$$ (as it is one more than a multiple of $$p$$),
   <!-- --> $$p - 1$$ is the [greatest common divisor](#greatest-common-divisor) of $$p^e - 1$$ and $$p^{e-1}(p - 1)$$.
   Finally, $$p - 1 = (p^e - 1) / \big(\sum_{i=0}^{e-1} p^i\big) = \frac{n - 1}{p^{e-1} + … + 1} ≤ \frac{n-1}{4}$$
   because $$p^{e-1} + 1 ≥ 4$$ for any $$p ≥ 3$$ and $$e ≥ 2$$.
   Thus, $$|\mathbb{L}_n^{F}| ≤ |\mathbb{Z}_n^{\cancel{0}}| / 4$$.
   This bound is reached for [$$n = 9$$](#tool-integer-miller-rabin-primality-test&input=9&candidates=1%2C+2%2C+3%2C+4%2C+5%2C+6%2C+7%2C+8&rounds=0&abort=false) (i.e. $$p = 3$$ and $$e = 2$$),
   where two out of eight elements (namely $$1$$ and $$8$$) are Miller-Rabin liars.
   This is the reason why I write $$|\mathbb{L}_n^{MR}| / |\mathbb{Z}_n^{\cancel{0}}| ≤ \frac{1}{4}$$
   instead of $$|\mathbb{L}_n^{MR}| / |\mathbb{Z}_n^\times| ≤ \frac{1}{4}$$ as $$\varphi(9) = 6$$
   and $$|\mathbb{L}_9^{MR}| / |\mathbb{Z}_9^\times| = \frac{2}{6} > \frac{1}{4}$$.
2. $$n = p_1^{e_1} \cdot … \cdot p_l^{e_l}$$ for $$l > 1$$ distinct odd primes $$p_i$$ and positive integers $$e_i$$:
   This case is more complicated because $$\mathbb{L}_n^{MR}$$ is generally not closed under multiplication.
   ([For example](#tool-integer-miller-rabin-primality-test&input=65&candidates=8%2C+18%2C+14&rounds=0),
   <!-- --> $$8$$ and $$18$$ are liars for $$n = 65$$,
   but $$8 \cdot 18 =_{65} 14$$ is a witness for the compositeness of $$n$$.)
   The [composite group](#composite-groups) $$\mathbb{Z}_n^\times$$ is [isomorphic](#group-isomorphisms)
   to the [direct product](#direct-product) of $$\mathbb{Z}_{p_1^{e_1}}^\times, …, \mathbb{Z}_{p_l^{e_l}}^\times$$.
   Let $$n - 1 = 2^cd$$ for an integer $$c ≥ 1$$ and an odd integer $$d$$.
   Similarly, $$\varphi(p_i^{e_i}) = 2^{c_i}d_i$$, where $$1 ≤ i ≤ l$$ and $$d_i$$ is odd.
   We define $$a$$ as the smallest integer in the set $$\{c, c_1, …, c_l\}$$.
   Since $$\varphi(p_i^{e_i})$$ is even for any odd prime $$p_i$$, $$a ≥ 1$$.
   Next, we'll prove a series of statements:
   - $$L^{2^ad} =_n 1$$ for all $$L \in \mathbb{L}_n^{MR}$$.
     If $$a = c$$, this is the case because every Miller-Rabin liar is also a Fermat liar (i.e. $$L^{n-1} =_n 1$$).
     If $$a < c$$, $$a = c_j$$ for some index $$j$$.
     If $$L^{2^bd} ≠_n 1$$ for some $$L \in \mathbb{L}_n^{MR}$$, we must have $$L^{2^bd} =_n -1$$
     for some $$b$$ greater than or equal to $$a$$ and smaller than $$c$$
     because $$L$$ wouldn't be a Miller-Rabin liar otherwise.
     If $$L^{2^bd} + 1$$ is a multiple of $$n$$, it is also a multiple of $$p_j^{e_j}$$.
     Therefore, $$L^{2^bd} =_n -1$$ implies that $$L^{2^bd} =_{p_j^{e_j}} -1$$.
     Since $$(L^d)^{2^b} =_{p_j^{e_j}} -1$$ and $$(L^d)^{2^{b+1}} =_{p_j^{e_j}} 1$$,
     the [order of $$L^d$$](#element-order) is $$2^{b+1}$$ in $$\mathbb{Z}_{p_j^{e_j}}^\times$$
     according to an [earlier theorem](#order-of-prime-power).
     However, the [order of $$\mathbb{Z}_{p_j^{e_j}}^\times$$](#group-order) is $$2^{c_j}d_j$$,
     which means that $$|L^d|$$ does not divide $$|\mathbb{Z}_{p_j^{e_j}}^\times|$$ because $$b + 1 > c_j$$.
     Since this is a [contradiction](#lagrange-consequences),
     there is no liar $$L \in \mathbb{L}_n^{MR}$$ for which $$L^{2^ad} ≠_n 1$$.
   - $$|\mathbb{L}_n^{MR}| ≤ 2 \cdot |f_{2^{a-1}d}^{-1}(\{1\})|$$.
     It follows from the previous point and the definition of a Millar-Rabin liar
     that $$L^{2^{a-1}d} =_n ±1$$ for all $$L \in \mathbb{L}_n^{MR}$$.
     Therefore, $$\mathbb{L}_n^{MR} \subseteq f_{2^{a-1}d}^{-1}(\{1\}) \cup f_{2^{a-1}d}^{-1}(\{-1\})$$.
     Let $$\{U_1, U_2, U_3, …, U_v\}$$ denote all the elements of $$f_{2^{a-1}d}^{-1}(\{-1\})$$.
     Then $$f_{2^{a-1}d}^{-1}(\{1\})$$ cannot be smaller than $$f_{2^{a-1}d}^{-1}(\{-1\})$$ because it contains
     at least the $$v$$ elements $$\{U_1 \cdot U_1, U_1 \cdot U_2, U_1 \cdot U_3, …, U_1 \cdot U_v\}$$.
     These elements are distinct because all preimages from $$U_1$$ to $$U_v$$ belong to $$\mathbb{Z}_n^\times$$
     and you get [different results](#unique-result) when you combine the same element with different elements in a group.
   - $$|f_y^{-1}(\{1\})| = \prod_{i=1}^{l} \operatorname{gcd}(y, 2^{c_i}d_i)$$ for any positive integer $$y$$.
     Since $$\mathbb{Z}_n^\times \cong \mathbb{Z}_{p_1^{e_1}}^\times \times … \times \mathbb{Z}_{p_l^{e_l}}^\times$$,
     the number of elements in $$\mathbb{Z}_n^\times$$ which map to $$1$$ when being raised to the $$y$$<sup>th</sup> power
     is given by the product of the number of elements which do the same in each of the groups
     <!-- --> $$\mathbb{Z}_{p_1^{e_1}}^\times$$ to $$\mathbb{Z}_{p_l^{e_l}}^\times$$.
     Since each $$\mathbb{Z}_{p_i^{e_i}}^\times$$ is a [cyclic group](#cyclic-groups),
     the formula from the [previous box](#power-function-and-its-preimage) can be used.
   - <!-- --> $$|f_{2^ad}^{-1}(\{1\})| = 2^l \cdot |f_{2^{a-1}d}^{-1}(\{1\})|$$.
     According to the previous point, $$|f_{2^ad}^{-1}(\{1\})| = \prod_{i=1}^{l} \operatorname{gcd}(2^ad, 2^{c_i}d_i)$$.
     Since $$a ≥ 1$$ and $$c_i ≥ a$$ for $$i = 1, …, l$$, we have that $$|f_{2^ad}^{-1}(\{1\})|
     = 2^l \cdot \prod_{i=1}^{l} \operatorname{gcd}(2^{a-1}d, 2^{c_i}d_i) = 2^l \cdot |f_{2^{a-1}d}^{-1}(\{1\})|$$.
     (This is why $$a$$ has to be smaller than or equal to each $$c_i$$;
     you wouldn't be able to extract the factor $$2$$ in each of the groups otherwise.)
   - <!-- --> $$|f_{2^ad}^{-1}(\{1\})| ≤ |f_{2^cd}^{-1}(\{1\})|$$
     because for any $$X \in \mathbb{Z}_n^\times$$ for which $$X^{2^ad} =_n 1$$,
     <!-- --> $$X^{2^cd} =_n 1$$ since $$c ≥ a$$.
   {:.mb-2 .mt-2}

   If follows from these statements that $$|\mathbb{L}_n^{MR}| ≤ 2^{-l+1} \cdot |f_{n-1}^{-1}(\{1\})|$$
   since $$|\mathbb{L}_n^{MR}| ≤ 2 \cdot |f_{2^{a-1}d}^{-1}(\{1\})|
   = 2 \cdot 2^{-l} \cdot |f_{2^ad}^{-1}(\{1\})| ≤ 2^{-l+1} \cdot |f_{2^cd}^{-1}(\{1\})|
   = 2^{-l+1} \cdot |f_{n-1}^{-1}(\{1\})|$$ given that $$2^cd = n - 1$$.
   There are two cases to consider:
   - <!-- --> $$l ≥ 3$$: This implies that $$|\mathbb{L}_n^{MR}| ≤ |f_{n-1}^{-1}(\{1\})| / 4$$.
     Since $$|f_{n-1}^{-1}(\{1\})| ≤ |\mathbb{Z}_n^\times|$$ and $$|\mathbb{Z}_n^\times| < |\mathbb{Z}_n^{\cancel{0}}|$$,
     we have $$|\mathbb{L}_n^{MR}| < |\mathbb{Z}_n^{\cancel{0}}| / 4$$.
   - <!-- --> $$l = 2$$:
     According to an [earlier theorem](#carmichael-numbers-are-a-product-of-at-least-three-distinct-primes),
     <!-- --> $$n$$ cannot be a [Carmichael number](#carmichael-numbers).
     Since in this case at most half of all coprime elements can be [Fermat liars](#fermat-primality-test),
     we have that $$|f_{n-1}^{-1}(\{1\})| = |\mathbb{L}_n^{F}| ≤ |\mathbb{Z}_n^\times| / 2$$.
     Thus, $$|\mathbb{L}_n^{MR}| ≤ 2^{-1} \cdot |f_{n-1}^{-1}(\{1\})| < |\mathbb{Z}_n^{\cancel{0}}| / 4$$.
   {:.mt-2}

</details>


### Sophie Germain and safe primes

A prime number $$p$$ is a [Sophie Germain prime](https://en.wikipedia.org/wiki/Safe_and_Sophie_Germain_primes),
named after [Marie-Sophie Germain](https://en.wikipedia.org/wiki/Sophie_Germain) (1776 − 1831),
if $$q = 2p + 1$$ is also prime.
A prime number $$q$$ for which $$p = (q - 1) / 2$$ is also prime
is called a [safe prime](https://en.wikipedia.org/wiki/Safe_and_Sophie_Germain_primes).
Safe primes are important in cryptography
because the difficulty of solving the [discrete-logarithm problem](#discrete-logarithm-problem)
is bounded by the largest prime factor of the [group's order](#group-order)
as we will see [later](#pohlig-hellman-algorithm).

<figure markdown="block" class="text-right">

| [Sophie Germain prime](https://oeis.org/A005384) | 2 | 3 | 5 | 11 | 23 | 29 | 41 | 53 | 83 | 89 | …
| [Safe prime](https://oeis.org/A005385) | 5 | 7 | 11 | 23 | 47 | 59 | 83 | 107 | 167 | 179 | …

<figcaption markdown="span">

The first ten Sophie Germain primes with their corresponding safe primes.

</figcaption>
</figure>


### Search for a probable prime

How do we find large prime numbers that we can use for cryptographic applications?
Since prime numbers are [sufficiently dense](#expected-number-of-attempts),
we can repeatedly check with the [Miller-Rabin primality test](#miller-rabin-primality-test)
whether a randomly generated integer of the desired length is a [probable prime](#probabilistic-primality-tests)
until we find one.
The following tool implements this random search for a probable prime.
If you need a [safe prime](#sophie-germain-and-safe-primes),
the tool generates a random number $$p$$ until both $$p$$ and $$q = 2p + 1$$ are probably prime.
In order to let you see what the tool is doing,
the tool waits for a fraction of a second after each attempt.
You should [disable this delay](#tool-integer-prime-number-generation&delay=0)
when generating large prime numbers.

<div id="tool-integer-prime-number-generation"></div>

<details markdown="block">
<summary markdown="span" id="primality-test-optimizations">
Primality test optimizations
</summary>

Since this algorithm tests many integers for their primality,
the performance of the prime number generation is determined by the performance of the employed primality test.
Here are some ways to reject composite inputs as quickly as possible:
- **Trial division by small primes**:
  Since every second number is a multiple of 2,
  every third number number is a multiple of 3, and so on,
  you can rule out a substantial fraction of inputs
  using [trial division](#prime-factorization) by small prime numbers.
  (To check that an input is odd, you have to verify only
  that the [least-significant bit](https://en.wikipedia.org/wiki/Bit_numbering) is 1.)
- **Coprimality with product of small primes**:
  You can check that an input is not a multiple of many small primes "at once"
  by checking that the input is [coprime](#multiset-of-prime-factors) with their product
  using the [Euclidean algorithm](#euclidean-algorithm).
  The product of the first $$l$$ prime numbers is known
  as the [primorial number](https://en.wikipedia.org/wiki/Primorial) $$p_l\# = \prod_{i=1}^{l} p_i$$,
  where $$p_i$$ is the $$i$$<sup>th</sup> prime number.
  For example, the product of the first 40 prime numbers is <span id="product-of-40-primes"></span>
  (see the last row of [this table](https://en.wikipedia.org/wiki/Primorial#Table_of_primorials)).
- **Incremental instead of random search**:
  Instead of choosing the next input randomly, you can increment the previous input by a known value.
  This has the advantage that you no longer need to perform the trial divisions
  if you store the remainders from the previous attempt.
  See the note 4.51 in the [Handbook of Applied Cryptography](https://cacr.uwaterloo.ca/hac/about/chap4.pdf)
  for a more detailed discussion of this approach.
  (The tool above increments even inputs by 1 to make them odd before performing any primality checks.)

</details>

<details markdown="block">
<summary markdown="span" id="expected-number-of-attempts">
Expected number of attempts
</summary>

As I mentioned [earlier](#density-of-carmichael-numbers-and-prime-numbers),
there are [approximately $$\frac{x}{\log_\mathrm{e}(x)}$$](https://en.wikipedia.org/wiki/Prime-counting_function)
prime numbers smaller than $$x$$.
Since half of all the integers are odd,
the probability that a random odd integer smaller than $$x$$ is prime
is around $$\frac{x}{\log_\mathrm{e}(x)} / \frac{x}{2} = \frac{2}{\log_\mathrm{e}(x)}$$.
Denoting the number of bits we are interested in as $$l$$,
we get $$\frac{2}{\log_\mathrm{e}(2^l)}$$.
Since $$s = \log_\mathrm{e}(2^l)$$ means that $$e^s = 2^l$$,
we can raise both sides by $$1 / l$$ to get $$e^{s/l} = 2$$.
Thus, $$\log_\mathrm{e}(2) = s / l$$ and $$s = l \cdot \log_\mathrm{e}(2) = \log_\mathrm{e}(2^l)$$,
which is one of the [logarithmic identities](https://en.wikipedia.org/wiki/Logarithm#Logarithmic_identities).
The number of [independent trials](https://en.wikipedia.org/wiki/Bernoulli_trial) needed to get a success
is given by the [geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution).
If the probability of success in each attempt is $$P$$, it takes on average $$\frac{1}{P}$$ attempts.
As a consequence, the expected number of attempts needed to find a prime number with $$l$$ bits
is $$l \cdot \frac{\log_\mathrm{e}(2)}{2} = 0.34657 \cdot l ≈ \frac{1}{3} l$$.
The probability of finding a [safe prime](#sophie-germain-and-safe-primes) is $$P^2$$,
which means that it takes $$(l \cdot \frac{\log_\mathrm{e}(2)}{2})^2 = 0.12 \cdot l^2$$ attempts on average.
The following table lists the expected number of attempts for lengths in the range of
the [tool above](#tool-integer-prime-number-generation).

<figure markdown="block" class="allow-break-inside">

| Number of bits | Expected number of attempts | Squared for safe prime
|-:|-:|-:
| 8 | 3 | 8
| 16 | 6 | 31
| 32 | 11 | 123
| 64 | 22 | 492
| 128 | 44 | 1'968
| 256 | 89 | 7'872
| 512 | 177 | 31'487
| 1'024 | 355 | 125'948
| 2'048 | 710 | 503'791

<figcaption markdown="span">

The expected number of attempts to find a (safe) prime of the given length rounded to the next integer.

</figcaption>
</figure>

While I implemented some of the optimizations mentioned in the [previous box](#primality-test-optimizations),
the tool is not fast enough to find a safe prime with 2'048 bits in a reasonable amount of time.
I still wanted to support this length so that you get a sense for how large the prime number
has to be in order to get a [reasonable amount of security](#bits-of-security).
(Finding a normal prime of this length is
[no problem](#tool-integer-prime-number-generation&bits=2048&safe=false&generator=false&delay=0).)

</details>

<details markdown="block">
<summary markdown="span" id="required-number-of-miller-rabin-rounds">
Required number of Miller-Rabin rounds
</summary>

Since the [Miller-Rabin primality test](#miller-rabin-primality-test)
is a [probabilistic primality test](#probabilistic-primality-tests),
what is the probability that the random search for a prime number returns a composite number?
How many rounds do we have to perform in the Miller-Rabin primality test
to push this probability below a certain value, such as $$(\frac{1}{2})^{80}$$?
You may think that this error probability is given by the
[Monier-Rabin bound on the number of liars](#monier-rabin-bound-on-the-number-of-liars),
namely $$(\frac{1}{4})^t$$, where $$t$$ denotes the number of rounds.
However, this bound limits the probability
that the Miller-Rabin primality test declares an input to be prime given that the input is composite.
Using mathematical notation, this is $$P(D_t \mid C) ≤ (\frac{1}{4})^t$$,
where $$D_t$$ denotes the [event](https://en.wikipedia.org/wiki/Event_(probability_theory))
that the input is declared prime after $$t$$ rounds of the Miller-Rabin primality test
and $$C$$ represents the event that the input is composite.
($$P(D_t \mid C)$$ is a [conditional probability](https://en.wikipedia.org/wiki/Conditional_probability),
which is defined as $$P(D_t \mid C) = \frac{P(D_t\ \cap\ C)}{P(C)}$$.)
What we are interested in here, though, is the probability that an input is composite
given that the Miller-Rabin primality test declared it to be prime after $$t$$ rounds: $$P(C \mid D_t)$$.
Using [Bayes' theorem](https://en.wikipedia.org/wiki/Bayes%27_theorem), we have

$$
P(C \mid D_t) = P(C) \cdot \frac{P(D_t \mid C)}{P(D_t)} ≤ \frac{P(D_t \mid C)}{P(D_t)} ≤ \frac{1}{r} (\frac{1}{4})^t
\textsf{,}
$$

where $$r$$ is the ratio of the inputs which are prime.
Since the Miller-Rabin primality test declares all inputs which are prime to be prime, $$P(D_t) ≥ r$$.
If $$r$$ is small, the probability $$P(C \mid D_t)$$ can be considerably larger than $$(\frac{1}{4})^t$$.
(For example, the probability of error is $$1$$ if the set of candidates contains only composite numbers.)
However, the fraction of Miller-Rabin liars is far smaller than $$\frac{1}{4}$$ for most numbers.
According to the note 4.49 in the [Handbook of Applied Cryptography](https://cacr.uwaterloo.ca/hac/about/chap4.pdf),
[it has been shown](http://www.math.dartmouth.edu/~carlp/PDF/paper88.pdf)
that just 6 rounds of the Miller-Rabin primality test are needed to push the probability
that the random search for a 512-bit prime returns a composite number below $$(\frac{1}{2})^{80}$$.
For 1'024 bits, 3 rounds are enough, and for 2'048 bits, it suffices to perform 2 rounds.
Since you perform on average [only a bit more than one round](#performance-impact-of-the-number-of-rounds)
of the Miller-Rabin primality test for unsuccessful candidates even in the worst case,
choosing a bigger $$t$$ won't affect the performance of the random search by much.
The situation is different when searching for safe primes,
but a better optimization is to increase your confidence that both $$p$$ and $$q = 2p + 1$$ are prime in parallel
instead of gaining high certainty that $$p$$ is prime before even considering $$q$$.
(I didn't implement this optimization in the [above tool](#tool-integer-prime-number-generation)
because it wouldn't match the visualization, including the counter of how many times $$p$$ was prime.)

Please note that this discussion applies only to the case where the candidates are sampled randomly.
If you test an input which is provided by an untrusted party,
you can rely only on the worst-case error bound of $$(\frac{1}{4})^t$$.
Not considering the adversarial setting has been an issue
[in many cryptography libraries](https://eprint.iacr.org/2018/749.pdf).
If you verify that an integer provided by someone else is prime,
you should use 64 rounds to push the risk of being exploited [below $$2^{-128}$$](#bits-of-security).
Alternatively, you can use the [Baillie-PSW primality test](https://en.wikipedia.org/wiki/Baillie%E2%80%93PSW_primality_test),
which is named after Robert Baillie,
[Carl Bernard Pomerance](https://en.wikipedia.org/wiki/Carl_Pomerance) (born in 1944),
[John Lewis Selfridge](https://en.wikipedia.org/wiki/John_Selfridge) (1927 − 2010), and
[Samuel Standfield Wagstaff Jr.](https://en.wikipedia.org/wiki/Samuel_S._Wagstaff_Jr.) (born in 1945).
This primality test consists of a single round of the Miller-Rabin primality test with the candidate 2 followed by the
[Lucas probable prime test](https://en.wikipedia.org/wiki/Lucas_pseudoprime#Implementing_a_Lucas_probable_prime_test),
which is named after [François Édouard Anatole Lucas](https://en.wikipedia.org/wiki/%C3%89douard_Lucas) (1842 − 1891).

</details>

<details markdown="block">
<summary markdown="span" id="performance-impact-of-the-number-of-rounds">
Performance impact of the number of rounds
</summary>

Since at most $$\frac{1}{4}$$ of all candidates of a composite number are [liars](#probabilistic-primality-tests),
the probability that you have to perform a second round of the [Miller-Rabin primality test](#miller-rabin-primality-test)
after performing a first round with a random candidate is at most $$\frac{1}{4}$$ for any composite number.
The probability that you need a third round is at most $$\frac{1}{16}$$, and so on.
In the worst case (the fraction of liars is usually much smaller than $$\frac{1}{4}$$),
the expected number of rounds needed to detect that a composite number is composite
is [$$1 + \frac{1}{4} + \frac{1}{16} + … = \frac{4}{3}$$](https://stackoverflow.com/a/6330138/12917821).
($$s = \sum_{i=0}^{\infin} r^i = 1 + r + r^2 + …$$
is a [geometric series](https://en.wikipedia.org/wiki/Geometric_series),
which converges to $$\frac{1}{1-r}$$ if $$|r| < 1$$
because $$s - rs = s(1 - r) = 1$$ as all but the first term cancel out.)
We get the same result when we interpret this
as the [geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution),
whose [expected value](https://en.wikipedia.org/wiki/Expected_value) is $$\frac{1}{P}$$,
with a success probability of $$P = \frac{3}{4}$$.
Ignoring the [optimizations mentioned above](#primality-test-optimizations),
we have to multiply the [expected number of attempts to find a probable prime](#expected-number-of-attempts)
by $$\frac{4}{3}$$ to get an estimate for the total number of Miller-Rabin primality test rounds
before the last attempt, which returns the probable prime after an additional $$t$$ rounds.
This estimate is not really affected by the parameter $$t$$.
For example, when we search for a 2'048-bit prime, we expect to perform in the order
of $$710 \cdot \frac{4}{3} = 947$$ rounds of the Miller-Rabin primality test before the last attempt.
Whether you perform an additional 2 or 64 rounds for the last attempt is only a matter of a few percentages.
The above optimizations make the impact of the last attempt on the overall performance significantly bigger,
but we're still talking about percentages and not multiples when we change the parameter $$t$$.

</details>


### Search for a group generator

Given a [cyclic group](#cyclic-groups) $$\mathbb{G}$$
and the [prime factorization](#prime-factorization) of its order $$n = p_1^{e_1}p_2^{e_2} … p_l^{e_l}$$,
<!-- --> $$G \in \mathbb{G}$$ generates the whole group [if and only if](#if-and-only-if)

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
\frac{n}{p_i}G ≠ O
$$

$$
G^\frac{n}{p_i} ≠ I
$$

</div>

for $$i$$ from $$1$$ to $$l$$.
(According to [Lagrange's theorem](#lagrange-consequences),
the [order of $$G$$](#element-order) has to divide the [group order](#group-order) $$n$$,
and the above condition ensures that the order of $$G$$ is not [one factor smaller](#multiset-of-prime-factors) than $$n$$.)
A simple way to find a [generator](#group-generators)
is to repeatedly choose a random element from $$\mathbb{G}$$ until this is the case.
Since a cyclic group of order $$n$$ has [$$\varphi(n)$$ generators](#number-of-generators-in-cyclic-groups),
the probability that a randomly chosen element generates the group is $$\frac{\varphi(n)}{n}$$.
The number of [trials](https://en.wikipedia.org/wiki/Bernoulli_trial) needed to find a generator
follows the [geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution).
This means that we find a generator after $$\frac{n}{\varphi(n)}$$ trials
[on average](https://en.wikipedia.org/wiki/Expected_value).
Since $$\varphi(n) > \frac{n}{6 \log_\mathrm{e}(\log_\mathrm{e}(n))}$$ for all $$n ≥ 5$$
(see the fact 2.102 in the [Handbook of Applied Cryptography](https://cacr.uwaterloo.ca/hac/about/chap2.pdf)),
<!-- --> $$\frac{n}{\varphi(n)} < 6 \log_\mathrm{e}(\log_\mathrm{e}(n))$$.
We will study a smarter version of this algorithm in a [box below](#a-faster-algorithm-for-finding-a-generator).

This algorithm can be used only if the prime factorization of the group's order is known.
As mentioned [earlier](#prime-factorization),
integer factorization is a [hard problem](#computational-complexity-theory).
We can avoid this problem for [multiplicative groups](#multiplicative-groups) modulo a prime number $$q$$
by choosing the factors of $$q - 1$$ first and then deriving $$q$$ from them,
as we did [when searching](#search-for-a-probable-prime) for a [safe prime](#sophie-germain-and-safe-primes).
In the case of a safe prime $$q = 2p + 1 > 5$$, $$|\href{#multiplicative-group-notations}{\mathbb{Z}_q^\times}| = 2p$$
and $$\varphi(|\mathbb{Z}_q^\times|) = \varphi(2p) = \varphi(2) \cdot \varphi(p) = p - 1$$.
(If [$$q = 5$$](#tool-table-multiplicative-group-repetition&modulus=5&coprime=false&repeat=false&order=false&totient=true)
and thus $$p = 2$$, $$\varphi(4) = \varphi(2^2) = 2^1(2 - 1) = 2 ≠ 2 - 1 = 1$$.)
If we ignore the elements $$1$$ and $$q - 1$$,
as the order of $$1$$ is $$1$$ and the order of $$q - 1$$ modulo $$q$$ is $$2$$,
then half of all the $$2p - 2 = 2(p - 1)$$ remaining elements in the group are generators.
This means that when we choose an element between $$1$$ and $$q - 1$$ at random (excluding both ends),
we have a 50% chance that this element generates the whole group.
As a consequence, we need only two attempts on average
to find a generator of the group $$\mathbb{Z}_q^\times$$, where $$q$$ is a safe prime.
Since $$q - 1$$ is [the only element of order $$2$$](#multiplicative-group-repetition-table) in a cyclic group,
<!-- --> $$G < q - 1$$ is a generator if $$G^p ≠_q 1$$.
You can [enable the generation of a generator](#tool-integer-prime-number-generation&safe=true&generator=true)
according to this logic in the [tool of the previous section](#tool-integer-prime-number-generation).
You can also convince yourself that half of all the elements between $$1$$ and $$q - 1$$ are generators
for all the safe primes greater than 5 and smaller than 100 (namely
[7](#tool-table-multiplicative-group-repetition&modulus=7&coprime=false&repeat=false&order=false&totient=true),
[11](#tool-table-multiplicative-group-repetition&modulus=11&coprime=false&repeat=false&order=false&totient=true),
[23](#tool-table-multiplicative-group-repetition&modulus=23&coprime=false&repeat=false&order=false&totient=true),
[47](#tool-table-multiplicative-group-repetition&modulus=47&coprime=false&repeat=false&order=false&totient=true),
[59](#tool-table-multiplicative-group-repetition&modulus=59&coprime=false&repeat=false&order=false&totient=true), and
[83](#tool-table-multiplicative-group-repetition&modulus=83&coprime=false&repeat=false&order=false&totient=true))
using the [repetition table of multiplicative groups](#multiplicative-group-repetition-table).

For the sake of simplicity, I use only the [multiplicative notation](#notation)
in the text parts of the following [information boxes](/#information-boxes).

<details markdown="block">
<summary markdown="span" id="generator-of-a-subgroup">
Generator of a subgroup
</summary>

Given a [generator](#group-generators) $$G$$ of a group $$\mathbb{G}$$ of [order](#group-order) $$n$$,
the element $$H = G^\frac{n}{d}$$ generates the [unique subgroup](#all-subgroups-of-cyclic-groups-are-cyclic)
<!-- --> $$\mathbb{H}$$ of order $$d$$, where $$d$$ is a [divisor](#divisor) of $$n$$.
(The order of $$H$$ has to be $$d$$ because the order of $$G$$ wouldn't be $$n$$ otherwise.)
If the order of the desired subgroup $$\mathbb{H}$$ is prime,
you don't need to find a generator of the [supergroup](#subgroups) $$\mathbb{G}$$ first.
To find a generator of the subgroup with the prime order $$p$$,
you can repeatedly choose a random element $$R \in \mathbb{G}$$ until $$R^\frac{n}{p} ≠ I$$.
Once you have found an element $$R$$ for which this is the case,
the element $$R^\frac{n}{p}$$ generates the subgroup of order $$p$$.
Proof: Clearly, $$(R^\frac{n}{p})^p = I$$ because $$A^n = I$$ for all $$A \in \mathbb{G}$$
due to [Lagrange's theorem](#lagrange-consequences).
Since $$(R^\frac{n}{p})^p = I$$ and $$(R^\frac{n}{p})^1 ≠ I$$,
it follows from an [earlier theorem with $$e = 1$$](#order-of-prime-power)
that the order of $$R^\frac{n}{p}$$ is $$p$$.

</details>

<details markdown="block">
<summary markdown="span" id="determining-the-order-of-an-element">
Determining the order of an element
</summary>

Given a [finite group](#finite-groups) $$\mathbb{G}$$ and the [prime factorization](#prime-factorization)
of its [order](#group-order) $$n = p_1^{e_1}p_2^{e_2} … p_l^{e_l}$$,
we want to determine the [order](#element-order) $$d$$ of an element $$A$$.
Due to [Lagrange's theorem](#lagrange-consequences), $$d$$ divides $$n$$.
Therefore, the [multiset of the prime factors](#multiset-of-prime-factors) of $$n$$
includes the multiset of the prime factors of $$d$$,
which means that $$d = p_1^{s_1}p_2^{s_2} … p_l^{s_l}$$, where $$s_i ≤ e_i$$ for $$i$$ from $$1$$ to $$l$$.
Since $$d$$ is the order of $$A$$, $$A^d = I$$ and $$A^{c \cdot d} = (A^d)^c = I^c = I$$ for any integer $$c$$.
This allows us to determine $$d$$ by lowering each of the $$e_i$$ to the lowest value $$s_i'$$
for which $$A$$ repeated $$d' = \prod_{i=1}^l p_i^{s_i'}$$ times still equals the [identity element](#group-axioms).
The important insight is that we can tweak each of the exponents independently from the others.
As long as $$s_i' ≥ s_i$$ for each of the exponents, $$d'$$ is still a multiple of $$d$$.
As soon as one $$s_i' < s_i$$, $$d'$$ is no longer a multiple of $$d$$, and thus $$A^{d'} ≠ I$$.
This gives us the following [algorithm](https://en.wikipedia.org/wiki/Algorithm) for determining the order of $$A$$:

<div class="tabbed text-left pre-background" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
\text{let } d := n \\
\text{for } (i \text{ from } 1 \text{ to } l)\ \{ \\
\quad d := d / p_i^{e_i} \\
\quad \text{let } B := d A \\
\quad \text{while } (B ≠ O)\ \{ \\
\quad \quad B := p_i B \\
\quad \quad d := d \cdot p_i \\
\quad \} \\
\} \\
\text{return } d
$$

$$
\text{let } d := n \\
\text{for } (i \text{ from } 1 \text{ to } l)\ \{ \\
\quad d := d / p_i^{e_i} \\
\quad \text{let } B := A^d \\
\quad \text{while } (B ≠ I)\ \{ \\
\quad \quad B := B^{p_i} \\
\quad \quad d := d \cdot p_i \\
\quad \} \\
\} \\
\text{return } d
$$

</div>

The algorithm does not require the group to be [cyclic](#cyclic-groups),
but it requires that the prime factorization of the group's order is known.
The following tool implements the above algorithm for arbitrarily large numbers
as long as it can [determine and then factorize](#limitations-of-the-above-tool) the order of the group
with [Pollard's rho factorization algorithm](#pollards-rho-factorization-algorithm).
You can ignore the tab titled [elliptic curve](#elliptic-curves) for now.

<div class="tabbed" data-titles="Multiplicative group | Elliptic curve | Both" data-default="Multiplicative group">
    <div id="tool-group-multiplicative-group-element-order"></div>
    <div id="tool-group-elliptic-curve-element-order"></div>
</div>

</details>

<details markdown="block">
<summary markdown="span" id="a-faster-algorithm-for-finding-a-generator">
A faster algorithm for finding a generator
</summary>

Given a [cyclic](#cyclic-groups), [commutative group](#commutative-groups) $$\mathbb{G}$$ and the
[prime factorization](#prime-factorization) of its [order](#group-order) $$n = p_1^{e_1}p_2^{e_2} … p_l^{e_l}$$,
we get a generator $$G$$ by doing

<div class="tabbed text-left pre-background" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
\text{for } (i \text{ from } 1 \text{ to } l)\ \{ \\
\quad \text{choose } A \in \mathbb{G} \text{ at random until } \frac{n}{p_i}A ≠ O \\
\quad \text{let } G_i := \frac{n}{p_i^{e_i}}A \\
\} \\
\text{return } G := \sum_{i=1}^l G_i
$$

$$
\text{for } (i \text{ from } 1 \text{ to } l)\ \{ \\
\quad \text{choose } A \in \mathbb{G} \text{ at random until } A^\frac{n}{p_i} ≠ I \\
\quad \text{let } G_i := A^\frac{n}{p_i^{e_i}} \\
\} \\
\text{return } G := \prod_{i=1}^l G_i
$$

</div>

Before we can understand why this algorithm works, we must note that the above construction implies that

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
p_i^{e_i} G_i = p_i^{e_i} (\frac{n}{p_i^{e_i}} A) = n A = O \quad \text{and} \quad
p_i^{e_i-1} G_i = p_i^{e_i-1} (\frac{n}{p_i^{e_i}} A) = \frac{n}{p_i} A ≠ O
$$

$$
G_i^{p_i^{e_i}} = (A^\frac{n}{p_i^{e_i}})^{p_i^{e_i}} = A^n = I \quad \text{and} \quad
G_i^{p_i^{e_i-1}} = (A^\frac{n}{p_i^{e_i}})^{p_i^{e_i-1}} = A^\frac{n}{p_i} ≠ I
$$

</div>

It follows from an [earlier theorem](#order-of-prime-power) that the [order](#element-order) of $$G_i$$ is $$p_i^{e_i}$$.
According to [another theorem](#order-when-combining-two-elements-of-coprime-orders), the order of $$G$$ is $$n$$
because $$\operatorname{\href{#greatest-common-divisor}{gcd}}(|G_i|, |G_j|) = 1$$ for all $$i ≠ j$$.
This means that if the algorithm terminates, $$G$$ is indeed a generator of the group $$\mathbb{G}$$.

This algorithm is quite fast because we need on average at most two attempts to find a suitable $$A$$ for each $$p_i$$.
This is because:
1. The [image](https://en.wikipedia.org/wiki/Image_(mathematics)) $$\mathbb{H} = f_{n/p_i}(\mathbb{G})$$
   of the [power function](#power-function-and-its-preimage) $$f_{n/p_i}$$
   is a [subgroup](#subgroups) of $$\mathbb{G}$$:
   Since every element in $$\mathbb{H}$$ is of the form $$A^{n/p_i}$$ for some $$A \in \mathbb{G}$$
   and the group operation is [commutative](#commutative-groups),
   <!-- --> $$A_1^{n/p_i} \cdot A_2^{n/p_i} = (A_1 \cdot A_2)^{n/p_i} \in \mathbb{H}$$
   because $$A_1 \cdot A_2 \in \mathbb{G}$$.
   Thus, $$\mathbb{H}$$ is [closed](#group-axioms).
   Since every element in $$\mathbb{G}$$ is mapped to some element in $$\mathbb{H}$$, $$\mathbb{H}$$ is not empty.
   [Therefore](#subgroups), $$\mathbb{H}$$ is indeed a subgroup of $$\mathbb{G}$$.
2. The [order](#group-order) of $$\mathbb{H}$$ is $$p_i$$:
   Given a [generator](#group-generators) $$G$$ of the group $$\mathbb{G}$$,
   <!-- --> $$G^{n/p_i} \in \mathbb{H}$$ has order $$p_i$$ because $$(G^{n/p_i})^{p_i} = G^n = I$$.
   Since the group generated by $$G^{n/p_i}$$ is included in $$\mathbb{H}$$ due to [closure](#group-axioms),
   <!-- --> $$\mathbb{H}$$ contains at least $$p_i$$ elements.
   Since $$\mathbb{G}$$ is [cyclic](#cyclic-groups),
   the subgroup $$\mathbb{H}$$ [is cyclic as well](#all-subgroups-of-cyclic-groups-are-cyclic).
   So let $$H$$ be a generator of $$\mathbb{H}$$ and $$J \in f_{n/p_i}^{-1}(\{H\})$$
   be any of its [preimages](https://en.wikipedia.org/wiki/Image_(mathematics)#Inverse_image).
   Since the order of $$J$$ can be at most $$n$$ due to [Lagrange's theorem](#lagrange-consequences),
   the order of $$H = J^{n/p_i}$$ can be at most $$p_i$$.
   Therefore, $$\mathbb{H}$$ contains exactly $$p_i$$ elements.
3. The preimage $$\mathbb{K} = f_{n/p_i}^{-1}(\{I\})$$ of the [identity element $$I$$](#group-axioms)
   is a subgroup of $$\mathbb{G}$$: $$I \in \mathbb{K}$$ because $$I^{n/p_i} = I$$.
   For any $$A_1, A_2 \in \mathbb{K}$$ (i.e. $$A_1^{n/p_i} = I$$ and $$A_2^{n/p_i} = I$$),
   <!-- --> $$A_1 \cdot A_2 \in \mathbb{K}$$
   because $$(A_1 \cdot A_2)^{n/p_i} = A_1^{n/p_i} \cdot A_2^{n/p_i} = I$$ due to [commutativity](#commutative-groups).
   Since $$\mathbb{K}$$ is non-empty and [closed](#group-axioms), $$\mathbb{K}$$ is a subgroup of $$\mathbb{G}$$.
   (As we will revisit [later](#kernel), $$\mathbb{K}$$ is the so-called
   [kernel](https://en.wikipedia.org/wiki/Kernel_(algebra)) of $$f_{n/p_i}$$.)
4. <!-- --> $$f_{n/p_i}$$ maps two inputs $$A$$ and $$B$$ to the same output [if and only if](#if-and-only-if)
   they belong to the same [coset](#subgroup-cosets) of $$\mathbb{K}$$:<br>
   <!-- --> $$A^{n/p_i} = B^{n/p_i} \iff A^{n/p_i} / B^{n/p_i} = I \iff (A / B)^{n/p_i} = I
   \iff A / B \in \mathbb{K} \iff A \in \mathbb{K} \cdot B$$.
5. <!-- --> $$A^{n/p_i}$$ is [distributed uniformly](https://en.wikipedia.org/wiki/Discrete_uniform_distribution)
   over $$\mathbb{H}$$ as $$A$$ is chosen at random from $$\mathbb{G}$$
   and all cosets contain [the same number of elements](#subgroup-cosets).
6. <!-- --> $$P(A^{n/p_i} = I) = \frac{1}{p_i} ≤ \frac{1}{2}$$ because of the previous point and $$|\mathbb{H}| = p_i$$.
   Therefore, the probability of success when choosing $$A$$ is $$P(A^{n/p_i} ≠ I) = 1 - \frac{1}{p_i} ≥ \frac{1}{2}$$.
   Since the number of attempts needed to find a suitable $$A$$ for each $$p_i$$
   follows the [geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution),
   the expected number of attempts is $$\frac{1}{1 - 1 / p_i} ≤ 2$$.

You find a more elaborate analysis of the [running time](https://en.wikipedia.org/wiki/Time_complexity)
of this algorithm on page 328 of [Victor Shoup's book](https://shoup.net/ntb/ntb-v2.pdf).
The following tool implements the above algorithm for cyclic groups.
As we saw [earlier](#carmichaels-totient-function),
a [multiplicative group](#multiplicative-groups) is cyclic [if and only if](#if-and-only-if)
<!-- --> $$\href{#carmichaels-totient-function}{\lambda}(m) = \href{#eulers-totient-function}{\varphi}(m)$$,
which is the case if and only if the modulus $$m = 2$$, $$4$$, $$p^e$$, or $$2p^e$$
for an odd prime $$p$$ and a positive integer $$e$$.
In the case of [elliptic curves](#elliptic-curves),
the situation is [more complicated](https://math.stackexchange.com/a/2324138/947937),
and the tool simply aborts after 128 failed attempts to find a suitable $$A$$.

<div class="tabbed" data-titles="Multiplicative group | Elliptic curve | Both" data-default="Multiplicative group">
    <div id="tool-group-multiplicative-group-generator-search"></div>
    <div id="tool-group-elliptic-curve-generator-search"></div>
</div>

</details>


## Commutative rings

In this article, this and the [next chapter](#finite-fields) build towards [elliptic curves](#elliptic-curves),
which constitute the second popular way to construct [linear one-way functions](#linear-one-way-functions).
However, the concepts presented in the following two chapters are also important in their own right.
We will encounter [repetition rings](#repetition-ring) when we will discuss cryptosystems
and [finite fields](#finite-fields) when we will study coding theory.


### Ring axioms

A [ring](https://en.wikipedia.org/wiki/Ring_(mathematics)) is an [algebraic structure](#abstract-algebra)
which consists of a [set](#notation-for-sets-and-elements) $$\mathbb{R}$$
and two [binary operations](https://en.wikipedia.org/wiki/Binary_operation),
called [addition (+)](https://en.wikipedia.org/wiki/Addition)
and [multiplication (·)](https://en.wikipedia.org/wiki/Multiplication),
which satisfy the [following axioms](https://en.wikipedia.org/wiki/Ring_(mathematics)#Definition)
(written in a compact notation using [universal and existential quantifiers](#universal-and-existential-quantifiers)):
- Addition forms a [commutative group](#commutative-groups):
  - [**Closure**](https://en.wikipedia.org/wiki/Closure_(mathematics)):
    <!-- --> $$\forall\ a, b \in \mathbb{R}\ a + b \in \mathbb{R}$$
  - [**Associativity**](https://en.wikipedia.org/wiki/Associative_property):
    <!-- --> $$\forall\ a, b, c \in \mathbb{R}\ (a + b) + c = a + (b + c)$$
  - [**Identity**](https://en.wikipedia.org/wiki/Identity_element):
    <!-- --> $$\exists\ 0 \in \mathbb{R}\ \forall\ a \in \mathbb{R}\ a + 0 = a$$
  - [**Invertibility**](https://en.wikipedia.org/wiki/Inverse_element):
    <!-- --> $$\forall\ a \in \mathbb{R}\ \exists\ {-}a \in \mathbb{R}\ a + (-a) = 0$$
  - [**Commutativity**](https://en.wikipedia.org/wiki/Commutative_property):
    <!-- --> $$\forall\ a, b \in \mathbb{R}\ a + b  = b + a$$
- Multiplication forms a so-called [monoid](https://en.wikipedia.org/wiki/Monoid)
  (a [group without invertibility](#group-like-algebraic-structures)):
  - [**Closure**](https://en.wikipedia.org/wiki/Closure_(mathematics)):
    <!-- --> $$\forall\ a, b \in \mathbb{R}\ a \cdot b \in \mathbb{R}$$
  - [**Associativity**](https://en.wikipedia.org/wiki/Associative_property):
    <!-- --> $$\forall\ a, b, c \in \mathbb{R}\ (a \cdot b) \cdot c = a \cdot (b \cdot c)$$
  - [**Identity**](https://en.wikipedia.org/wiki/Identity_element):
    <!-- --> $$\exists\ 1 \in \mathbb{R}\ \forall\ a \in \mathbb{R}\ a \cdot 1 = a = 1 \cdot a$$
- Multiplication distributes over addition:
  - [**Distributivity**](https://en.wikipedia.org/wiki/Distributive_property):
    <!-- --> $$\forall\ a, b, c \in \mathbb{R}\ a \cdot (b + c) = a \cdot b + a \cdot c$$

As the title of this chapter suggests,
we're interested only in [commutative rings](https://en.wikipedia.org/wiki/Commutative_ring),
whose multiplication operation is commutative:
- [**Commutativity**](https://en.wikipedia.org/wiki/Commutative_property):
  <!-- --> $$\forall\ a, b \in \mathbb{R}\ a \cdot b  = b \cdot a$$

<details markdown="block" open>
<summary markdown="span" id="remarks-on-the-notation">
Remarks on the notation
</summary>

- **Lowercase**: I use lowercase letters to denote the elements of a ring
  instead of uppercase letters as I did in the case of [groups](#finite-groups).
  This makes it easier to tell groups and rings apart:
  As we will see [in a moment](#repetition-ring),
  the inputs of our [linear one-way functions](#linear-one-way-functions) form a ring,
  whereas the outputs belong to a group.
  The inputs of the linear one-way functions [scale](https://en.wikipedia.org/wiki/Scalar_(mathematics)) the outputs,
  and it's common to write [coefficients](https://en.wikipedia.org/wiki/Coefficient) in lowercase.
- **Identities**: Since the only rings we are interested in for now consist of integers,
  it's convenient to use the integers 0 and 1 to denote the additive and the multiplicative identity.
- **Precedence**: By convention, multiplication and division are evaluated before addition and subtraction,
  i.e. $$a \cdot b + a \cdot c$$ is to be interpreted as $$(a \cdot b) + (a \cdot c)$$.
  ([Exponentiation](https://en.wikipedia.org/wiki/Exponentiation)
  and [root extraction](https://en.wikipedia.org/wiki/Root_extraction)
  have an even higher [precedence](https://en.wikipedia.org/wiki/Order_of_operations).)
- <!-- --> $$\mathbb{R}$$: This symbol is usually used to denote
  the [set of real numbers](https://en.wikipedia.org/wiki/Real_number).
  Since we talk only about integers throughout this article,
  I decided to use this symbol despite this conflict in meaning.

</details>

<details markdown="block">
<summary markdown="span" id="universal-and-existential-quantifiers">
Universal and existential quantifiers
</summary>

When making a statement about the elements of a set, it is important to indicate
whether the statment is true for all elements of the set or just for some elements of the set.
In [predicate logic](https://en.wikipedia.org/wiki/First-order_logic),
one uses the [universal quantifier $$\forall$$](https://en.wikipedia.org/wiki/Universal_quantification)
("for all") for the former
and the [existential quantifier $$\exists$$](https://en.wikipedia.org/wiki/Existential_quantification)
("it exists") for the latter.
The most important [rule of inference](https://en.wikipedia.org/wiki/Rule_of_inference)
is [universal instantiation](https://en.wikipedia.org/wiki/Universal_instantiation):
If a statement is true for all elements of a set, it is true for any particular element of the set.
The order of quantifiers matters:
The identity axiom says that there is at least one element which is an identity for all elements of the set,
whereas the invertibility axiom says that for all elements of the set at least one element exists
which is an inverse for that particular element.

</details>

<details markdown="block">
<summary markdown="span" id="multiplicative-identity-crisis">
Multiplicative identity crisis
</summary>

I stated the [group axioms](#group-axioms) for addition in the [ring axioms](#ring-axioms) above
in a [reduced form](#reduced-group-axioms).
Ignoring for now that the definition of invertibility is [ambiguous](#less-ambiguous-notation),
it still follows from these reduced group axioms
that [the right identity is unique](#uniqueness-of-right-identity)
and that [the right identity is also a left identity](#right-identity-is-left-identity)
(see the [last chapter](#group-properties)).
As far as I can tell, we have to require that the right identity is also a left identity in the case of a monoid
in order to ensure that the identity of the monoid is unique.
(If there were two distinct identities $$E_1$$ and $$E_2$$, then $$E_1 = E_1 \circ E_2 = E_2$$,
which is a [contradiction](https://en.wikipedia.org/wiki/Proof_by_contradiction).)
Alternatively, we could require that both a left identity and a right identity exist in a monoid.
(If there were two distinct left identities $$E_1$$ and $$E_2$$ and a right identity $$E$$,
then $$E_1 = E_1 \circ E = E$$ and $$E_2 = E_2 \circ E = E$$, which contradicts that $$E_1 ≠ E_2$$.)

</details>


### Integers modulo m

As we saw earlier, the integers [modulo](#modulo-operation) an integer $$m$$ form an [additive group](#additive-groups).
Such a group is also closed under multiplication.
Multiplication is still associative when the result is reduced to its [remainder](#euclidean-division),
and the integer $$1$$ is the [multiplicative identity](https://en.wikipedia.org/wiki/Identity_element#Definitions).
Since multiplication means repeated addition
and addition is [associative](https://en.wikipedia.org/wiki/Associative_property)
and [commutative](https://en.wikipedia.org/wiki/Commutative_property),
multiplication distributes over addition:

$$
a \cdot (b + c)
=_m \underbrace{(b + c) + … + (b + c)}_{a \text{ times}}
=_m \underbrace{b + … + b}_{a \text{ times}} + \underbrace{c + … + c}_{a \text{ times}}
=_m a \cdot b + a \cdot c
$$

Therefore, the integers modulo $$m$$, which we write as $$\mathbb{Z}/m\mathbb{Z}$$ or $$\mathbb{Z}_m$$
(see [above](#additive-group-notations) and [below](#quotient-rings)), form a (commutative) ring.
You can use the following tool to perform modular addition and multiplication with arbitrarily large numbers,
which is handy in cryptography:

<div id="tool-ring-operations"></div>

<details markdown="block">
<summary markdown="span" id="subrings">
Subrings
</summary>

A ring $$\mathbb{S}$$ is a [subring](https://en.wikipedia.org/wiki/Subring) of another ring $$\mathbb{R}$$
if $$\mathbb{S}$$ is a [subset](https://en.wikipedia.org/wiki/Subset) of $$\mathbb{R}$$
and the [ring axioms](#ring-axioms) hold for addition and multiplication restricted to $$\mathbb{S}$$.
Since the modulus $$m$$ is part of these operations
(it defines what it means to be [equivalent](#equivalence-relation)),
the integers modulo $$m$$ have no subrings other than the whole ring
because the multiplicative identity $$1$$ generates the whole additive group.

</details>

<details markdown="block">
<summary markdown="span" id="zero-ring">
Zero ring
</summary>

The [above axioms](#ring-axioms) don't require that $$0 ≠ 1$$.
If the additive identity equals the multiplicative identity,
all elements in the ring are equal to these identities:

$$
\begin{aligned}
\forall\ a \in \mathbb{R} \quad a &= a \cdot 1 && \textsf{since } 1 \textsf{ is the multiplicative identity} \\
&= a \cdot 0 && \textsf{since}\ 1 = 0 \\
&= 0 && \textsf{see the \href{#multiplication-by-zero}{next section}}
\end{aligned}
$$

A ring which contains only a single element is a so-called [zero ring](https://en.wikipedia.org/wiki/Zero_ring).
Since all zero rings are [isomorphic](#group-isomorphisms) to one another,
we speak of *the* zero ring, denoted as $$\{0\}$$.
The zero ring is not a [subring](#subrings) of any non-zero ring
because the additive identity is different from the multiplicative identity in non-zero rings,
and a subring must have the same identities as its superring in order to satisfy the axioms for the same operations.
We're not interested in such technicalities,
and we will exclude the case where $$0 = 1$$ explicitly when [defining fields](#field-axioms),
as it is commonly done.

</details>


### Derived properties {#derived-ring-properties}

Since addition forms a group and multiplication forms a monoid,
the additive identity and the [multiplicative identity](#multiplicative-identity-crisis) of a ring are unique.
It also follows that [the additive inverse is unique](#uniqueness-of-inverses).
Other consequences of the ring axioms are:


#### Multiplication by zero

$$
\boxed{\, \forall\ a \in \mathbb{R}\ a \cdot 0 = 0 \, \vphantom{\large |}}
$$

$$
a \cdot 0 = a \cdot (0 + 0) = a \cdot 0 + a \cdot 0 \\[2pt]
\textsf{Add } {-}(a \cdot 0) \textsf{ on both sides to get } 0 = a \cdot 0 \textsf{.}
$$


#### Multiplication by minus one

$$
\boxed{\, \forall\ a \in \mathbb{R}\ a \cdot (-1) = {-}a \, \vphantom{\large |}}
$$

$$
\begin{aligned}
a \cdot 0 &= 0 && \textsf{as just proven} \\
a \cdot (1 + (-1)) &= 0 && \textsf{since } 0 = 1 + (-1) \\
a \cdot 1 + a \cdot (-1) &= 0 && \textsf{due to distributivity} \\
a + a \cdot (-1) &= 0 && \textsf{since } a \cdot 1 = a \\
a \cdot (-1) &= -a && \textsf{add } {-}a \textsf{ on both sides}
\end{aligned}
$$


### Units and zero divisors

An element of a ring may or may not have a multiplicative inverse.
An element which has a multiplicative inverse is a so-called [unit](https://en.wikipedia.org/wiki/Unit_(ring_theory)).
An element $$a$$ is called a [zero divisor](https://en.wikipedia.org/wiki/Zero_divisor)
if there exists a non-zero element $$x$$ so that $$a \cdot x = 0$$.
(Since we care only about [commutative rings](#ring-axioms),
we don't distinguish between left and right zero divisors.)
Every element of a finite ring is either a unit or a zero divisor, which can be seen as follows.
Consider the function $$f_a(x) = a \cdot x$$, which multiplies the input by some element $$a$$.
Since the multiplication of ring elements is [closed](#ring-axioms),
this function maps each element of $$\mathbb{R}$$ to another element of $$\mathbb{R}$$,
which is usually written as $$f_a{:}\ \mathbb{R} \to \mathbb{R}$$.
(In mathematical terms, $$\mathbb{R}$$ is both the [domain](https://en.wikipedia.org/wiki/Domain_of_a_function)
and the [codomain](https://en.wikipedia.org/wiki/Codomain) of the function.)
Depending on $$a$$, $$f_a$$ is either so-called [injective](https://en.wikipedia.org/wiki/Injective_function) or not:
- **Injective**: $$f_a$$ maps distinct inputs to distinct outputs,
  which means that $$x_1 ≠ x_2$$ implies that $$f_a(x_1) ≠ f_a(x_2)$$.
  By [contraposition](https://en.wikipedia.org/wiki/Contraposition),
  this also means that $$f_a(x_1) = f_a(x_2)$$ implies that $$x_1 = x_2$$.
  Since the codomain of the function (the set of potential outputs) is just as large as its domain (the set of inputs),
  there has to be an element $$x$$ for each $$y \in \mathbb{R}$$ so that $$f_a(x) = y$$.
  (A function whose [image](https://en.wikipedia.org/wiki/Image_(mathematics)) covers its codomain
  is said to be [surjective](https://en.wikipedia.org/wiki/Surjective_function).
  A function which is both injective and surjective is said to be [bijective](https://en.wikipedia.org/wiki/Bijection).)
  As a consequence, $$f_a$$ is a [permutation](https://en.wikipedia.org/wiki/Permutation).
  (We've already encountered permutations [in the context of groups](#permutations).)
  It follows that there is an element $$a^{-1}$$ for which $$f_a(a^{-1}) = a \cdot a^{-1} = 1$$
  and that there is no element $$z$$ other than zero for which $$f_a(z) = a \cdot z = 0$$.
  (As we&nbsp;saw [above](#multiplication-by-zero), $$f_a(0) = a \cdot 0 = 0$$.)
  This means that if $$f_a$$ is injective for some element $$a$$,
  then $$a$$ is a unit and not a zero divisor.
- **Non-injective**: If $$f_a$$ is not injective,
  there are distinct elements $$x_1$$ and $$x_2$$ for which $$f_a(x_1) = f_a(x_2)$$.
  Since $$a \cdot x_1 = a \cdot x_2$$ and $$x_1 ≠ x_2$$, $$a$$ is a zero divisor
  because $$a \cdot x_1 - a \cdot x_2 = a \cdot (x_1 - x_2) = 0$$ due to [distributivity](#ring-axioms).
  (As we saw [earlier](#least-common-multiple-and-0), $$f_a(x_1) = f_a(x_2)$$ also implies
  that $$f_a(x_1 + b) = f_a(x_2 + b)$$ for any element $$b$$
  because $$a \cdot (x_1 + b) = a \cdot x_1 + a \cdot b = a \cdot x_2 + a \cdot b = a \cdot (x_2 + b)$$,
  which means that the outputs repeat after a [collision](https://en.wikipedia.org/wiki/Hash_collision).)
  Since at least two inputs map to the same output, there has to be at least one element $$y \in \mathbb{R}$$
  for which there exists no element $$x$$ so that $$f_a(x) = a \cdot x = y$$.
  If $$a$$ had a multiplicative inverse $$a^{-1}$$, the element $$a^{-1} \cdot y$$
  (which exists due to [closure](#ring-axioms)) would constitute such an input
  as $$f_a(a^{-1} \cdot y) = a \cdot (a^{-1} \cdot y) = (a \cdot a^{-1}) \cdot y = y$$
  due to [associativity](#ring-axioms).
  Therefore, zero divisors can't have a multiplicative inverse
  because the existence of a multiplicative inverse makes the mapping injective,
  whereas a zero divisor makes the mapping non-injective as $$f_a(x) = 0$$ for $$0$$ and another element.

The existence of zero divisors is "undesirable" because it destroys the
[cancellation property](https://en.wikipedia.org/wiki/Cancellation_property):
<!-- --> $$a \cdot b = a \cdot c$$ implies that $$b = c$$ only if $$a$$ is not a zero divisor.
If $$a$$ is a zero divisor,
then $$b$$ equals $$c$$ only up to a multiple of the smallest element $$z$$ for which $$a \cdot z = 0$$.
You can observe these facts in the [operation table of multiplicative groups](#multiplicative-group-operation-table)
when you choose a non-prime modulus,
such as [15](#tool-table-multiplicative-group-operation&modulus=15&coprime=false&zero=true&composite=false).

<details markdown="block">
<summary markdown="span" id="integral-domains">
Integral domains
</summary>

The statement that each element is either [a unit or a zero divisor](#units-and-zero-divisors)
doesn't hold for rings with an infinite number of elements.
For example, the [integers $$\mathbb{Z}$$](https://en.wikipedia.org/wiki/Integer)
form a ring under ordinary addition and multiplication.
The only elements which have a multiplicative inverse in $$\mathbb{Z}$$ are $$+1$$ and $$-1$$,
yet no integer other than $$0$$ divides $$0$$.
A [non-zero](#zero-ring) commutative ring where the product of any two non-zero elements is non-zero
(i.e. $$0$$ is the only zero divisor), is called an [integral domain](https://en.wikipedia.org/wiki/Integral_domain).
Since every element of a finite ring is either a unit or a zero divisor,
every finite integral domain is a [field](#finite-fields).
Since we're interested only in finite [algebraic structures](#abstract-algebra),
we don't care about integral domains.
I still want to note that the cancellation property holds also for infinite rings:
If $$a$$ is not a zero divisor, then $$a \cdot b = a \cdot c$$ implies that $$b = c$$
because $$a \cdot b = a \cdot c$$ implies that $$a \cdot b - a \cdot c = a \cdot (b - c) = 0$$
and $$b - c$$ has to equal $$0$$ given that $$a$$ is not a zero divisor,
which is the case only if $$b = c$$.

</details>

<details markdown="block">
<summary markdown="span" id="uniqueness-of-the-multiplicative-inverse-in-rings">
Uniqueness of the multiplicative inverse in rings
</summary>

If an element of a ring has a multiplicative inverse, the multiplicative inverse is unique.
For finite rings, this fact follows directly from the [argument above](#units-and-zero-divisors).
(If $$a$$ is a unit, $$f_a$$ is a permutation, and thus there is only a single element for which $$f_a(x) = 1$$.)
It's not difficult to show that this fact holds for infinite rings as well:
After proving that [a right inverse is also a left inverse](#right-inverses-are-left-inverses)
(or simply requiring that the ring is [commutative](#ring-axioms)),
any two inverses $$a_1^{-1}$$ and $$a_2^{-1}$$ of $$a$$ are the same because $$a_1^{-1}
= a_1^{-1} \cdot 1
= a_1^{-1} \cdot (a \cdot a_2^{-1})
= (a_1^{-1} \cdot a) \cdot a_2^{-1}
= 1 \cdot a_2^{-1}
= a_2^{-1}$$.

</details>

<details markdown="block">
<summary markdown="span" id="multiplicative-group-of-units">
Multiplicative group of units
</summary>

Given a ring $$\mathbb{R}$$, the set of all [units](#units-and-zero-divisors) in $$\mathbb{R}$$
is usually denoted as $$\mathbb{R}^\times$$ (or as $$\mathbb{R}^*$$).
<!-- --> $$\mathbb{R}^\times$$ forms a [group](#group-axioms) under the ring's multiplication:
- **Identity**: The multiplicative identity $$1$$ is a unit and thus included in $$\mathbb{R}^\times$$
  because it has a multiplicative inverse, namely itself.
- **Invertibility**: By definition, every unit has a multiplicative inverse.
  Since [a right inverse is also a left inverse](#right-inverses-are-left-inverses) and vice versa,
  every inverse is itself invertible
  (i.e. if $$b$$ is the inverse of $$a$$, then $$a$$ is the inverse of $$b$$).
- **Closure**: The product of two units is another unit because
  for any $$a, b \in \mathbb{R}^\times$$, $$(a \cdot b)^{-1} = b^{-1} \cdot a^{-1}$$
  as $$(a \cdot b) \cdot (b^{-1} \cdot a^{-1})
  = (a \cdot (b \cdot b^{-1})) \cdot a^{-1} = a \cdot a^{-1} = 1$$.
  ($$a^{-1}$$ and $$b^{-1}$$ exist because $$a$$ and $$b$$ are units.)
- **Associativity**: Since multiplication is the same operation as in the ring, it is still associative.

The notation for the group of units shouldn't surprise you.
I've been using it since I introduced [multiplicative groups](#multiplicative-groups):
[$$\mathbb{Z}_m$$](#integers-modulo-m) $$\to$$ [$$\mathbb{Z}_m^\times$$](#multiplicative-group-notations).

</details>


### Repetition ring

There are two reasons why we study rings.
For one thing, fields,
which we'll discuss in the [next chapter](#finite-fields) in order to construct [elliptic curves](#elliptic-curves),
are simply rings in which all non-zero elements are [units](#units-and-zero-divisors).
For another thing, we learned that you reach the [identity element](#group-axioms)
when you [repeat an element](#element-repetitions) $$A$$ of a [finite group](#finite-groups) often enough.
From there on, you will get [the same elements in the same order](#repeated-group-elements).
This means that we can reduce the number of repetitions [modulo](#modulo-operation)
the [element's order](#element-order) $$|A|$$ without affecting the result:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
nA = (n\ \href{#modulo-operation}{\%}\ |A|)A \textsf{ \href{#lagrange-consequences}{since} } (|A|)A = O
$$

$$
A^n = A^{n\ \href{#modulo-operation}{\%}\ |A|} \textsf{ \href{#lagrange-consequences}{since} } A^{|A|} = I
$$

</div>

When constructing a [linear one-way function](#linear-one-way-functions) to be used in cryptosystems,
we typically repeat a [generator](#group-generators) $$G$$.
Since the function is linear,
we can add and multiply two inputs $$a$$ and $$b$$ in the output [space](https://en.wikipedia.org/wiki/Vector_space)
[while knowing only](#motivation) the input $$b$$ and the output $$A = f(a)$$:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

- **Addition**: $$f(a + b) = (a + b)G = aG + bG = A + bG$$
- **Multiplication**: $$f(a \cdot b) = (a \cdot b)G = b(aG) = bA$$

<!-- -->

- **Addition**: $$f(a + b) = G^{a + b} = G^a \cdot G^b = A \cdot G^b$$
- **Multiplication**: $$f(a \cdot b) = G^{a \cdot b} = (G^a)^b = A^b$$

</div>

Since we compute the addition and the multiplication of inputs modulo the generator's order $$\lvert G \rvert$$,
the inputs of our linear one-way function [form a finite ring](#integers-modulo-m).
I call it the repetition ring of the element which is repeated,
even though I haven't found anyone else who uses this term.
If the linear one-way function is constructed with a [multiplicative group modulo $$m$$](#multiplicative-groups),
it's very easy to confuse the group operation, which is multiplication modulo $$m$$,
with multiplication in the repetition ring, which is computed
modulo $$|\href{#multiplicative-group-notations}{\mathbb{Z}_m^\times}| = \href{#eulers-totient-function}{\varphi(m)}$$.
In order to minimize confusion, I use uppercase letters for the elements of the group
and lowercase letters for the elements of the ring.
As mentioned [earlier](#equivalence-relation),
this is also why I keep the modulus next to the equals sign.
For example, such a linear one-way function transforms the [equivalence relation](#equivalence-relation)
<!-- --> $$a \cdot b + c =_{\varphi(m)} d$$ into $$(G^a)^b \cdot G^c =_m G^d$$,
i.e. the latter relation holds [if and only if](#if-and-only-if) the former does.
Since the repetition ring is a ring,
an element $$a$$ [may or may not have a multiplicative inverse](#units-and-zero-divisors).
For example, $$(G^a)^x =_m G$$ has a solution $$x$$
if and only if $$a$$ has a multiplicative inverse modulo $$\varphi(m)$$,
in which case $$x =_{\varphi(m)} a^{-1}$$.


### Advanced concepts

While [Wikipedia](https://en.wikipedia.org/wiki/Main_Page) lists the following topics
[as basic concepts](https://en.wikipedia.org/wiki/Ring_(mathematics)#Basic_concepts),
they are fairly advanced for our standards.
I put all of them in [optional information boxes](/#optional-reading)
because we don't need any of them.
They just provide an outlook into the bigger mathematical context,
and having an elementary understanding of them makes it easier to read the sources
that I've referenced throughout this article, including Wikipedia.
They also explain the notation [$$\mathbb{Z}/m\mathbb{Z}$$](#additive-group-notations).
I advise you to skip these boxes if you're not interested in any of this.

<details markdown="block">
<summary markdown="span" id="homomorphisms">
Homomorphisms
</summary>

A [homomorphism](https://en.wikipedia.org/wiki/Homomorphism) is a function
which maps the elements of one [algebraic structure](#abstract-algebra)
to the elements of a similar algebraic structure while preserving the relations between the elements in each structure
under the operations of the corresponding structure.
Unlike an [isomorphism](https://en.wikipedia.org/wiki/Isomorphism),
which has to be invertible (see the [group isomorphisms](#group-isomorphisms) above),
a homomorphism can map several elements of its [domain](https://en.wikipedia.org/wiki/Domain_of_a_function)
to a single element of its [codomain](https://en.wikipedia.org/wiki/Codomain)
and doesn't have to reach all the elements of its codomain.
In other words, a homomorphism has to be neither [injective](https://en.wikipedia.org/wiki/Injective_function))
nor [surjective](https://en.wikipedia.org/wiki/Surjective_function),
while an isomorphism has to be both in order to be [bijective](https://en.wikipedia.org/wiki/Bijection).
(Every isomorphism is a homomorphism,
but a homomorphism is an isomorphism [if and only if](#if-and-only-if) it is bijective.)

Given two rings $$\mathbb{R}_1$$ and $$\mathbb{R}_2$$,
a [ring homomorphism](https://en.wikipedia.org/wiki/Ring_homomorphism)
is a function $$f{:}\ \mathbb{R}_1 \to \mathbb{R}_2$$ which satisfies the following properties:
1. **Preservation of addition**: For all $$a, b \in \mathbb{R}_1$$, $$f(a +_1 b) = f(a) +_2 f(b)$$.
2. **Preservation of multiplication**: For all $$a, b \in \mathbb{R}_1$$, $$f(a \cdot_1 b) = f(a) \cdot_2 f(b)$$.
3. **Preservation of the multiplicative identity**: $$f(1_1) = 1_2$$.

The index indicates to which ring an operation or an identity element belongs.
The third property prevents that all elements are mapped to $$0_2$$.
It follows from these properties that the additive identity
and additive and multiplicative inverses are [preserved](#group-isomorphisms).

</details>

<details markdown="block">
<summary markdown="span" id="kernel">
Kernel
</summary>

The [kernel](https://en.wikipedia.org/wiki/Kernel_(algebra))
of a [homomorphism](#homomorphisms) $$f{:}\ \mathbb{R}_1 \to \mathbb{R}_2$$
is the [preimage](https://en.wikipedia.org/wiki/Image_(mathematics)#Inverse_image)
of the additive identity element (or just the identity element in the case of groups):
<!-- --> $$\mathbb{K}_f = \{x \in \mathbb{R}_1 \mid f(x) = 0_2 \} = f^{-1}(\{ 0_2 \})$$
(see [these](#notation-for-sets-and-elements) [boxes](#power-function-and-its-preimage)
if you don't understand these notations).
(The kernel is usually written as $$\ker(f)$$ or $$\ker f$$ instead of $$\mathbb{K}_f$$,
but I decided to make use of my [artistic license](https://en.wikipedia.org/wiki/Artistic_license) again.)

The kernel $$\mathbb{K}_f$$ of a homomorphism $$f{:}\ \mathbb{R}_1 \to \mathbb{R}_2$$ has some interesting properties:
1. The kernel is a [group](#group-axioms) under addition:
   - **Closure**: For all $$a, b \in \mathbb{K}_f$$, $$a +_1 b \in \mathbb{K}_f$$
     because $$f(a +_1 b) = f(a) +_2 f(b) = 0_2 +_2 0_2 = 0_2$$.
   - **Associativity**: Inherited from the associativity of addition in $$\mathbb{R}_1$$.
   - **Identity**: $$0_1 \in \mathbb{K}_f \iff f(0_1) = 0_2$$
     because you can cancel $$f(0_1)$$ from $$f(0_1) = f(0_1 +_1 0_1) = f(0_1) +_2 f(0_1)$$.
   - **Invertibility**: For all $$a \in \mathbb{K}_f$$, $$-a \in \mathbb{K}_f$$
     because $$0_2 = f(0_1) = f(a +_1 (-a)) = f(a) +_2 f(-a) = f(-a)$$.
2. A homomorphism maps two inputs $$a$$ and $$b$$ to the same output [if and only if](#if-and-only-if)
   they belong to the same [coset](#subgroup-cosets) of its kernel:
   <!-- --> $$f(a) = f(b) \iff f(a) -_2 f(b) = 0_2 \iff f(a -_1 b) = 0_2
   \iff a -_1 b \in \mathbb{K}_f \iff a \in \mathbb{K}_f +_1 b$$.
   Obviously, $$b \in \mathbb{K}_f +_1 b$$ because $$0_1 \in \mathbb{K}_f$$.
   (You may have noticed that we've already used this fact [earlier](#a-faster-algorithm-for-finding-a-generator).)
3. $$f$$ is [injective](https://en.wikipedia.org/wiki/Injective_function) if and only if $$\mathbb{K}_f = \{0_1\}$$.
   One direction of this equivalence is trivial to prove:
   If $$f$$ is injective, no two inputs are mapped to the same output, including $$0_2$$.
   If $$f$$ is not injective, there are at least two distinct elements $$a, b \in \mathbb{R}_1$$ so that $$f(a) = f(b)$$.
   Therefore, $$a -_1 b \in \mathbb{K}_f$$ as shown in the previous point.
   Since $$a ≠ b$$, $$a -_1 b ≠ 0_1$$,
   which proves the [contraposition](https://en.wikipedia.org/wiki/Contraposition) of the other direction.

</details>

<details markdown="block">
<summary markdown="span" id="ideals">
Ideals
</summary>

An [ideal](https://en.wikipedia.org/wiki/Ideal_(ring_theory)) $$\mathbb{I}$$
is a subset of the elements of a [ring](#ring-axioms) $$\mathbb{R}$$
so that they form a [group](#group-axioms) under addition
and that they absorb all the elements of $$\mathbb{R}$$ under multiplication,
which means that for every $$r \in \mathbb{R}$$ and every $$i \in \mathbb{I}$$, $$r \cdot i \in \mathbb{I}$$.
(If the ring is not [commutative](#ring-axioms), one has to distinguish between
[left ideals and right ideals](https://en.wikipedia.org/wiki/Ideal_(ring_theory)#Definitions_and_motivation),
whose intersection consists of the two-sided ideals.)
Ideals are usually not [subrings](#subrings), as they typically lack the multiplicative identity.
For example, given the ring of [integers $$\mathbb{Z}$$](https://en.wikipedia.org/wiki/Integer),
the set of all the multiples of an integer $$n$$,
which is commonly written as $$n \mathbb{Z} = \{n \cdot z \mid z \in \mathbb{Z}\}$$, is an ideal.
This set is closed under addition (the sum of two multiples of $$n$$ is another multiple of $$n$$),
addition remains associative (the order in which you add multiples of $$n$$ doesn't matter),
it has an identity element ($$0$$ is a multiple of $$n$$ because [$$n \cdot 0 = 0$$](#multiplication-by-zero)),
and every element has an additive inverse ($$(n \cdot z) + (n \cdot (-z)) = n \cdot (z - z) = 0$$).
Additionally, if you multiply any multiple of $$n$$ by any integer, you get another multiple of $$n$$.

The [kernel](#kernel) $$\mathbb{K}_f$$ of a [homomorphism](#homomorphisms) $$f$$ is an ideal
because the kernel forms a group under addition (see the first property in the [previous box](#kernel))
and the kernel absorbs all the elements under multiplication
since for all $$r \in \mathbb{R}_1$$ and all $$k \in \mathbb{K}_f$$,
<!-- --> $$r \cdot_1 k \in \mathbb{K}_f$$ as $$f(r \cdot_1 k) = f(r) \cdot_2 f(k) = f(r) \cdot_2 0_2 = 0_2$$.

</details>

<details markdown="block">
<summary markdown="span" id="principal-ideals">
Principal ideals
</summary>

A [principal ideal](https://en.wikipedia.org/wiki/Principal_ideal)
is an [ideal](#ideals) in a [ring](#ring-axioms) $$\mathbb{R}$$
which is generated by multiplying a single element $$a$$ of $$\mathbb{R}$$ by every element of $$\mathbb{R}$$.
Such a principal ideal is often written as $$a \mathbb{R} = \{a \cdot r \mid r \in \mathbb{R}\}$$.
If the ring is not [commutative](#ring-axioms), $$a \mathbb{R}$$ can be different from $$\mathbb{R} a$$.
If they are the same, the ideal generated by $$a$$ is also written as $$⟨a⟩$$ or simply as $$(a)$$.
As we saw earlier when we discussed [Bézout's identity](#bezouts-identity),
every [linear combination](https://en.wikipedia.org/wiki/Linear_combination) of any two integers $$a$$ and $$b$$
is a multiple of $$\operatorname{\href{#greatest-common-divisor}{gcd}}(a, b)$$.
This means that any ideal in the ring of integers $$\mathbb{Z}$$ can be generated by a single element,
which makes $$\mathbb{Z}$$ a so-called [principal ideal domain](https://en.wikipedia.org/wiki/Principal_ideal_domain).

</details>

<details markdown="block">
<summary markdown="span" id="quotient-rings">
Quotient rings
</summary>

Given a [ring](#ring-axioms) $$\mathbb{R}$$
and a ([two-sided](https://en.wikipedia.org/wiki/Ideal_(ring_theory)#Definitions_and_motivation))
[ideal](#ideals) $$\mathbb{I}$$ in $$\mathbb{R}$$,
we can define an [equivalence relation](#equivalence-relation) $$=_{\mathbb{I}}$$
so that for any $$a, b \in \mathbb{R}$$,
<!-- --> $$a =_{\mathbb{I}} b$$ [if and only if](#if-and-only-if) $$a - b \in \mathbb{I}$$.
For $$=_{\mathbb{I}}$$ to be an equivalence relation,
it must satisfy the [following properties](#equivalence-properties)
for any elements $$a$$, $$b$$, and $$c \in \mathbb{R}$$:
- [**Reflexivity**](https://en.wikipedia.org/wiki/Reflexive_relation):
  $$a =_{\mathbb{I}} a$$.
  Since every ideal includes $$0$$, $$a - a = 0 \in \mathbb{I}$$.
- [**Symmetry**](https://en.wikipedia.org/wiki/Symmetric_relation):
  If $$a =_{\mathbb{I}} b$$, then $$b =_{\mathbb{I}} a$$.
  Since the elements of an ideal form an additive group,
  an ideal contains the additive inverse of each of its elements.
  Therefore, if $$a - b \in \mathbb{I}$$, then $$b - a \href{#inversion-of-combination}{=} -(a - b) \in \mathbb{I}$$.
- [**Transitivity**](https://en.wikipedia.org/wiki/Transitive_relation):
  If $$a =_{\mathbb{I}} b$$ and $$b =_{\mathbb{I}} c$$, then $$a =_{\mathbb{I}} c$$.
  Since $$a - b \in \mathbb{I}$$ and $$b - c \in \mathbb{I}$$,
  <!-- --> $$(a - b) + (b - c) = a - c \in \mathbb{I}$$ because every ideal is closed under addition
  (i.e. if $$i \in \mathbb{I}$$ and $$j \in \mathbb{I}$$, then $$i + j \in \mathbb{I}$$,
  which also means that $$i =_{\mathbb{I}} j$$).

A set of equivalent elements is called an [equivalence class](https://en.wikipedia.org/wiki/Equivalence_class).
Transitivity implies that any two equivalence classes overlap each other completely or not at all but not partially.
Since the elements of both the ring and the ideal form a group under addition,
the ideal is an additive subgroup of the ring.
Since $$a - b \in \mathbb{I} \iff a \in \mathbb{I} + b$$
and $$b \in \mathbb{I} + b$$ because $$0 \in \mathbb{I}$$,
two elements are identical if and only if they belong to the same additive [cosets](#subgroup-cosets) of the ideal.
As shown [earlier](#cosets-are-equal-or-disjoint),
cosets are either equal or [disjoint](https://en.wikipedia.org/wiki/Disjoint_sets).

Interestingly, $$=_{\mathbb{I}}$$ is also a [congruence relation](#congruence-relation),
which means that equivalent inputs result in equivalent outputs under addition and multiplication:
Given $$a_1, a_2, b_1, b_2 \in \mathbb{R}$$ where $$a_1 =_{\mathbb{I}} a_2$$ and $$b_1 =_{\mathbb{I}} b_2$$, then
- $$a_1 + b_1 =_{\mathbb{I}} a_2 + b_2$$ because $$a_1 - a_2 =_{\mathbb{I}} b_2 - b_1$$
  as we required that $$a_1 - a_2 \in \mathbb{I}$$ and $$b_2 - b_1 \in \mathbb{I}$$, and
- $$a_1 \cdot b_1 =_{\mathbb{I}} a_2 \cdot b_2$$ because $$a_1 = a_2 + i_a$$ for some $$i_a \in \mathbb{I}$$
  and $$b_1 = b_2 + i_b$$ for some $$i_b \in \mathbb{I}$$,
  and thus $$a_1 \cdot b_1 = (a_2 + i_a) \cdot (b_2 + i_b)
  = a_2 \cdot b_2 + a_2 \cdot i_b + i_a \cdot b_2 + i_a \cdot i_b$$.
  Now $$a_2 \cdot b_2 + a_2 \cdot i_b + i_a \cdot b_2 + i_a \cdot i_b =_{\mathbb{I}} a_2 \cdot b_2$$
  because $$a_2 \cdot b_2 + a_2 \cdot i_b + i_a \cdot b_2 + i_a \cdot i_b - a_2 \cdot b_2
  = a_2 \cdot i_b + i_a \cdot b_2 + i_a \cdot i_b \in \mathbb{I}$$
  since $$\mathbb{I}$$ absorbs multiplication and is closed under addition.

Therefore, addition and multiplication are well-defined for the cosets of $$\mathbb{I}$$:
No matter which elements from two cosets you add or multiply, all results belong to the same coset.
As a consequence, the function $$f(x) = \mathbb{I} + x = \{i + x \mid i \in \mathbb{I}\}$$
is a [ring homomorphism](#homomorphisms), where $$\mathbb{I}$$ is the additive identity
because $$\mathbb{I} + \mathbb{I} = \mathbb{I}$$ (closure under addition)
and $$a \cdot \mathbb{I} = \mathbb{I}$$ for any $$a \in \mathbb{R}$$ (absorption of multiplication),
and $$\mathbb{I}$$ is also the [kernel](#kernel) of $$f$$ because for all $$i \in \mathbb{I}$$
and only those $$i$$s, $$f(i) = \mathbb{I} + i = \mathbb{I}$$:
1. **Preservation of addition**: For all $$a, b \in \mathbb{R}$$, $$f(a + b) = \mathbb{I} + (a + b)
   = \mathbb{I} + \mathbb{I} + (a + b) = (\mathbb{I} + a) + (\mathbb{I} + b) = f(a) + f(b)$$.
2. **Preservation of multiplication**: For all $$a, b \in \mathbb{R}$$, $$f(a \cdot b) = \mathbb{I} + (a \cdot b)
   = \mathbb{I} \cdot \mathbb{I} + \mathbb{I} \cdot b + a \cdot \mathbb{I} + a \cdot b
   = (\mathbb{I} + a) \cdot (\mathbb{I} + b) = f(a) \cdot f(b)$$,
   where $$\mathbb{A} \cdot \mathbb{B} = \{a \cdot b \mid a \in \mathbb{A},  b \in \mathbb{B} \}$$
   instead of the [Cartesian product](https://en.wikipedia.org/wiki/Cartesian_product) of sets.
3. **Preservation of the multiplicative identity**: $$f(1) = \mathbb{I} + 1$$,
   which is the multiplicative identity because $$(\mathbb{I} + a) \cdot (\mathbb{I} + 1)
   = \mathbb{I} \cdot \mathbb{I} + \mathbb{I} \cdot 1 + a \cdot \mathbb{I} + a \cdot 1 = \mathbb{I} + a$$
   for any $$a \in \mathbb{R}$$.

Since the ideal $$\mathbb{I}$$ "divides" (partitions) the ring $$\mathbb{R}$$,
the ring of cosets is called the [quotient ring](https://en.wikipedia.org/wiki/Quotient_ring)
of $$\mathbb{R}$$ modulo $$\mathbb{I}$$, written as $$\mathbb{R} / \mathbb{I}$$.
So not only does a ring homomorphism define a kernel, which is an ideal,
an ideal also defines a homomorphism, whose kernel is the ideal itself.
A ring homomorphism $$f$$ maps all the elements of a coset of $$\mathbb{K}_f$$ to a single element
because for all $$a \in \mathbb{K}_f + b$$,
<!-- --> $$f(a) = f(k_a + b) = f(k_a) + f(b) = 0 + f(b) = f(b)$$ for some $$k_a \in \mathbb{K}_f$$.
We thus have an invertible mapping between the cosets of $$\mathbb{K}_f$$
and the [image](https://en.wikipedia.org/wiki/Image_(mathematics)) of $$f$$,
which means that the quotient ring of $$\mathbb{R}$$ modulo $$\mathbb{K}_f$$
is [isomorphic](#homomorphisms) to the image $$f(\mathbb{R})$$ of $$f$$:

$$
\mathbb{R} / \mathbb{K}_f \href{#group-isomorphisms}{\cong} f(\mathbb{R})
$$

[This theorem](https://en.wikipedia.org/wiki/Isomorphism_theorems#Theorem_A_(rings))
has some interesting [edge cases](https://en.wikipedia.org/wiki/Edge_case).
If the ideal (and thus the kernel) is the ring itself, all elements are mapped to zero,
and the quotient ring is isomorphic to the [zero ring](#zero-ring): $$\mathbb{R} / \mathbb{R} \cong \{0\}$$.
(This is the case if the multiplicative identity belongs to the ideal.)
On the other hand, if the ideal contains only zero,
the quotient ring is isomorphic to the ring itself: $$\mathbb{R} / \{0\} \cong \mathbb{R}$$.

In the scope of this article, we're interested only in integers [modulo](#modulo-operation) an integer $$m$$,
where we have $$\mathbb{Z} / m \mathbb{Z} \cong \mathbb{Z}_m$$.
As noted [above](#ideals), $$m \mathbb{Z}$$ is the ideal which consists of all multiples of $$m$$.
We can visualize what we learned in this box as follows for $$m = 3$$:

<figure markdown="block">
{% include_relative generated/quotient-ring.embedded.svg %}
<figcaption markdown="span" style="max-width: 875px;">

The homomorphism $$f(x) = x\ \href{#modulo-operation}{\%}\ 3$$ maps the elements of the infinite ring $$\mathbb{Z}$$ (in blue)
to the elements of the finite ring $$\mathbb{Z}_3$$ (in green).
All and only the multiples of $$3$$ are mapped to $$0$$,
which means that $$\mathbb{K}_f = 3 \mathbb{Z}$$, which is an infinite ideal.
The cosets of this ideal are the elements of the quotient ring $$\mathbb{Z} / 3 \mathbb{Z}$$ (in purple).
Since the elements of each coset are mapped to a distinct element of $$\mathbb{Z}_3$$,
we have $$\mathbb{Z} / 3 \mathbb{Z} \cong \mathbb{Z}_3$$.

</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="quotient-groups">
Quotient groups
</summary>

The [ring](#ring-axioms)-related concepts from the previous boxes
have [group](#group-axioms)-related equivalents:

<figure markdown="block">

| [Ring](https://en.wikipedia.org/wiki/Ring_(algebra)) | [Group](https://en.wikipedia.org/wiki/Group_(mathematics))
|-
| [Ring homomorphism](https://en.wikipedia.org/wiki/Ring_homomorphism) | [Group homomorphism](https://en.wikipedia.org/wiki/Group_homomorphism)
| [Kernel](https://en.wikipedia.org/wiki/Kernel_(algebra)#Ring_homomorphisms) as preimage of $$0$$ | [Kernel](https://en.wikipedia.org/wiki/Kernel_(algebra)#Group_homomorphisms) as preimage of $$E$$
| [Two-sided ideal](https://en.wikipedia.org/wiki/Ideal_(ring_theory)) | [Normal subgroup](https://en.wikipedia.org/wiki/Normal_subgroup)
| [Quotient ring](https://en.wikipedia.org/wiki/Quotient_ring) | [Quotient group](https://en.wikipedia.org/wiki/Quotient_group)

<figcaption markdown="span">

An overview of ring- and group-related concepts.

</figcaption>
</figure>

Just like an additive subgroup of a ring has to satisfy an additional requirement to be an [ideal](#ideals),
a [subgroup](#subgroups) $$\mathbb{H}$$ of a group $$\mathbb{G}$$ is a normal subgroup
[if and only if](#if-and-only-if) the [left coset](#subgroup-cosets) $$G \circ \mathbb{H}$$
equals the [right coset](#subgroup-cosets) $$\mathbb{H} \circ G$$ for all $$G \in \mathbb{G}$$.
In [commutative groups](#commutative-groups), every subgroup is normal.
There's a great explanation on why we need this condition for non-commutative groups
[on Stack Exchange](https://math.stackexchange.com/a/14315/947937).
See also [this answer on Quora](https://www.quora.com/What-are-some-examples-of-subgroups-of-non-abelian-groups-that-are-normal-and-others-that-are-not-normal/answer/Alon-Amit),
which introduces [conjugacy classes](https://en.wikipedia.org/wiki/Conjugacy_class).
Both answers use the [symmetric group](https://en.wikipedia.org/wiki/Symmetric_group) $$\mathrm{S}_3$$ as an example.

</details>


## Finite fields


### Field axioms

A [field](https://en.wikipedia.org/wiki/Field_(mathematics)) is a [commutative ring](#ring-axioms)
where all non-zero elements are [units](#units-and-zero-divisors) (i.e. have a multiplicative inverse)
and $$0 ≠ 1$$.
While the elements of a ring form a [commutative group](#commutative-groups) only under addition,
the non-zero elements of a field form a commutative group also under multiplication.
Even though most of it is repetition,
we can state the [field axioms](https://en.wikipedia.org/wiki/Field_(mathematics)#Classic_definition)
for a [set](#notation-for-sets-and-elements) $$\mathbb{F}$$
and two [binary operations](https://en.wikipedia.org/wiki/Binary_operation),
called [addition (+)](https://en.wikipedia.org/wiki/Addition)
and [multiplication (·)](https://en.wikipedia.org/wiki/Multiplication), as follows
(written in a compact notation using [universal and existential quantifiers](#universal-and-existential-quantifiers)):
- The elements of the field form a commutative [group](#group-axioms) under addition:
  - [**Closure**](https://en.wikipedia.org/wiki/Closure_(mathematics)):
    <!-- --> $$\forall\ a, b \in \mathbb{F}\ a + b \in \mathbb{F}$$
  - [**Associativity**](https://en.wikipedia.org/wiki/Associative_property):
    <!-- --> $$\forall\ a, b, c \in \mathbb{F}\ (a + b) + c = a + (b + c)$$
  - [**Identity**](https://en.wikipedia.org/wiki/Identity_element):
    <!-- --> $$\exists\ 0 \in \mathbb{F}\ \forall\ a \in \mathbb{F}\ a + 0 = a$$
  - [**Invertibility**](https://en.wikipedia.org/wiki/Inverse_element):
    <!-- --> $$\forall\ a \in \mathbb{F}\ \exists\ {-}a \in \mathbb{F}\ a + (-a) = 0$$
  - [**Commutativity**](https://en.wikipedia.org/wiki/Commutative_property):
    <!-- --> $$\forall\ a, b \in \mathbb{F}\ a + b  = b + a$$
- The non-zero elements of the field form a commutative [group](#group-axioms) under multiplication:
  - [**Closure**](https://en.wikipedia.org/wiki/Closure_(mathematics)):
    <!-- --> $$\forall\ a, b \in \mathbb{F}\ a \cdot b \in \mathbb{F}$$
  - [**Associativity**](https://en.wikipedia.org/wiki/Associative_property):
    <!-- --> $$\forall\ a, b, c \in \mathbb{F}\ (a \cdot b) \cdot c = a \cdot (b \cdot c)$$
  - [**Identity**](https://en.wikipedia.org/wiki/Identity_element):
    <!-- --> $$\exists\ 1 \in \mathbb{F}\ \forall\ a \in \mathbb{F}\ a \cdot 1 = a$$
  - [**Invertibility**](https://en.wikipedia.org/wiki/Inverse_element):
    <!-- --> $$\forall\ a \in \href{https://en.wikipedia.org/wiki/Complement_(set_theory)}{\mathbb{F} \setminus \{0\}} \ \exists\ a^{-1} \in \mathbb{F}\ a \cdot a^{-1} = 1$$
  - [**Commutativity**](https://en.wikipedia.org/wiki/Commutative_property):
    <!-- --> $$\forall\ a, b \in \mathbb{F}\ a \cdot b  = b \cdot a$$
- Multiplication distributes over addition:
  - [**Distributivity**](https://en.wikipedia.org/wiki/Distributive_property):
    <!-- --> $$\forall\ a, b, c \in \mathbb{F}\ a \cdot (b + c) = a \cdot b + a \cdot c$$
- The additive identity is different from the multiplicative identity:
  - [**Non-triviality**](https://en.wikipedia.org/wiki/Zero_ring#Properties):
    <!-- --> $$0 ≠ 1$$

<details markdown="block">
<summary markdown="span" id="infinite-fields">
Infinite fields
</summary>

Examples for infinite fields are the [rational numbers $$\mathbb{Q}$$](https://en.wikipedia.org/wiki/Rational_number),
the [real numbers $$\mathbb{R}$$](https://en.wikipedia.org/wiki/Real_number),
and the [complex numbers $$\mathbb{C}$$](https://en.wikipedia.org/wiki/Complex_number).

</details>

<details markdown="block">
<summary markdown="span" id="multiplicative-group-of-a-field">
Multiplicative group of a field
</summary>

Given that I quantified the various multiplication axioms over different sets,
it's admittedly not obvious why the non-zero elements of a field form a group under multiplication.
Clearly, if associativity, identity, and commutativity hold for all the elements of a field,
then they also hold for a subset of them.
Since every field is a ring, multiplication by $$0$$ always [results in $$0$$](#multiplication-by-zero).
Therefore, the inverse of a non-zero element is another non-zero element because you wouldn't get $$1$$ otherwise.
As we saw [above](#units-and-zero-divisors) and will prove again [below](#no-non-trivial-zero-divisors),
invertibility implies that there are no non-trivial zero divisors.
Consequently, the product of two non-zero elements is another non-zero element,
which means that the non-zero elements are closed under multiplication.

</details>

<details markdown="block">
<summary markdown="span" id="commutativity-of-addition">
Commutativity of addition
</summary>

Strictly speaking, commutativity of addition is not required as an axiom
because [it follows from the other axioms](https://people.reed.edu/~mayer/math112.html/html1/node17.html#commfield).

</details>


### Integers modulo p

The [ring](#ring-axioms) [$$\mathbb{Z}_m$$](#integers-modulo-m) is a field
[if and only if](#if-and-only-if) the modulus $$m$$ is [prime](#prime-factorization).
As we saw [earlier](#multiplicative-inverse-revisited),
an integer has a [multiplicative inverse modulo $$m$$](#modular-multiplicative-inverse)
if and only if it is [coprime](#prime-factorization) with $$m$$.
If $$m$$ is prime, then all the positive integers smaller than $$m$$ are relatively prime to $$m$$.
If $$m$$ is composite, its factors are [zero divisors](#units-and-zero-divisors),
which prevents $$\mathbb{Z}_m$$ from being a field.
Excluding non-coprime integers from the field as we did in the case of [multiplicative groups](#multiplicative-groups)
no longer works because repeatedly adding $$1$$ to itself [generates](#group-generators)
all the integers from $$0$$ to $$m - 1$$.
Put differently, filtering non-coprime integers breaks the closure of addition.
I added such a filtering option to the [operation table of additive groups](#additive-group-operation-table)
just so that you can convince yourself that this is indeed the case.

<details markdown="block">
<summary markdown="span" id="cyclicity-of-the-additive-group">
Cyclicity of the additive group
</summary>

In the case of integers modulo a prime number $$p$$,
the [additive group](#additive-groups) is [cyclic](#cyclic-groups)
because the multiplicative identity $$1$$ [generates the whole group](#group-generators).
In the article about coding theory,
we will extend these so-called [prime fields](https://en.wikipedia.org/wiki/Finite_field#Properties) and see
that the additive group of a proper [extension field](https://en.wikipedia.org/wiki/Field_extension) is not cyclic.

</details>

<details markdown="block">
<summary markdown="span" id="cyclicity-of-the-multiplicative-group">
Cyclicity of the multiplicative group
</summary>

The [multiplicative group](#multiplicative-groups) of any field is [cyclic](#cyclic-groups):
As mentioned but not yet proven [earlier](#why-multiplicative-groups-modulo-a-prime-are-cyclic),
a polynomial of degree $$d > 0$$ over any field evaluates to $$0$$ for at most $$d$$ distinct inputs.
If we label the multiplicative group of a field $$\mathbb{F}$$ as [$$\mathbb{F}^\times$$](#multiplicative-group-of-units),
where $$\mathbb{F}^\times = \href{https://en.wikipedia.org/wiki/Complement_(set_theory)}{\mathbb{F} \setminus \{0\}}$$,
we have that $$X^{|\mathbb{F}^\times|} = 1$$ for all $$X \in \mathbb{F}^\times$$
due to [Lagrange's theorem](#lagrange-consequences).
The [exponent of $$\mathbb{F}^\times$$](#exponent-of-a-multiplicative-group) is the smallest positive integer $$n$$
so that $$X^n = 1$$ for all $$X \in \mathbb{F}^\times$$.
Since the polynomial $$X^n - 1$$ can evaluate to $$0$$ for at most $$n$$ elements
but $$X^n - 1 = 0$$ for all $$X \in \mathbb{F}^\times$$,
<!-- --> $$n$$ cannot be smaller than $$|\mathbb{F}^\times|$$.
As proven [earlier](#exponent-of-a-multiplicative-group), an element of order $$n = |\mathbb{F}^\times|$$ exists.
Therefore, $$\mathbb{F}^\times$$ is cyclic.

</details>


### Field notation

We are interested only in [finite fields](https://en.wikipedia.org/wiki/Finite_field),
i.e. fields which contain a finite number of elements.
Finite fields are also called Galois fields (GF),
named after [Évariste Galois](https://en.wikipedia.org/wiki/%C3%89variste_Galois) (1811 − 1832),
who died at the age of 20 in a [duel](https://en.wikipedia.org/wiki/Duel).
The number of elements in a finite field is called its [order](#group-order).
Without explaining why, the order of a finite field is always a [prime power](https://en.wikipedia.org/wiki/Prime_power),
and all the finite fields of the same order are [isomorphic](#homomorphisms) to one another.
Given $$q = p^e$$, where $$p$$ is a prime number and $$e$$ is a positive integer,
the unique field of order $$q$$ is denoted as $$\mathbb{F}_q$$ or $$GF(q)$$.
For integers modulo a prime number, I will also use $$\mathbb{Z}_p$$,
where $$p$$ indicates that the modulus is [prime](#prime-factorization).


### Derived properties {#derived-field-properties}

Many properties, such as that the additive identity and the multiplicative identity are unique
or that the additive inverse and the multiplicative inverse of an element are unique,
follow from the fact that addition and multiplication (in the latter case without $$0$$)
form [groups](#derived-group-properties).
Since every [field](#field-axioms) is a [ring](#ring-axioms),
the [properties we proved for rings](#derived-ring-properties) still apply.
Other consequences of the field axioms are:


#### Multiplicative inverse of minus one

$$
\boxed{\, (-1)^{-1} = -1 \, \vphantom{\large |}}
$$

$$
\begin{aligned}
-(-1) &= (-1) \cdot (-1) && \textsf{as proven \href{#multiplication-by-minus-one}{above}, where } a = -1 \\
1 &= (-1) \cdot (-1) && \textsf{using the \href{#double-inverse-theorem}{double inverse theorem}} \\
1 \cdot (-1)^{-1} &= (-1) \cdot (-1) \cdot (-1)^{-1} && \textsf{multiplying both sides by } (-1)^{-1} \\
(-1)^{-1} &= -1 && \textsf{simplifying both sides as usual}
\end{aligned}
$$


#### Multiplicative inverse of additive inverse

$$
\boxed{\, \forall\ a \in \mathbb{F}\ (-a)^{-1} = -(a^{-1}) \, \vphantom{\large |}}
$$

$$
\begin{aligned}
(-a)^{-1} &= ((-1) \cdot a)^{-1} && \textsf{using \href{#multiplication-by-minus-one}{multiplication by minus one}} \\
&= (-1)^{-1} \cdot a^{-1} && \textsf{using \href{#inversion-of-combination}{inversion of combination}} \\
&= (-1) \cdot a^{-1} && \textsf{using \href{#multiplicative-inverse-of-minus-one}{multiplicative inverse of minus one}} \\
&= -(a^{-1}) && \textsf{using \href{#multiplication-by-minus-one}{multiplication by minus one}}
\end{aligned}
$$

Stated in words, the multiplicative inverse of the additive inverse is the same
as the additive inverse of the multiplicative inverse for every element of every field.
What we knew from the rational numbers with ordinary division
($$\tfrac{1}{-a} = -\tfrac{1}{a}$$) thus holds in any field.


#### No non-trivial zero divisors

$$
\boxed{\, \forall\ a, b \in \mathbb{F} \enspace a \cdot b = 0 \implies a = 0 \lor b = 0 \, \vphantom{\large |}}
$$

If $$a = 0$$, the above [implication](#material-implication) is true.
If $$a \neq 0$$, then $$a$$ has a multiplicative inverse, and thus

$$
\begin{aligned}
a \cdot b &= 0 && \textsf{starting with the premise of the above statement} \\
a^{-1} \cdot a \cdot b &= a^{-1} \cdot 0 && \textsf{multiplying both sides by } a^{-1} \\
b &= 0 && \textsf{simplifying both sides as usual,}
\end{aligned}
$$

which makes $$a = 0 \lor b = 0$$ true in the other case as well.
This is also known as the [zero-product property](https://en.wikipedia.org/wiki/Zero-product_property).

<details markdown="block">
<summary markdown="span" id="material-implication">
Material implication $$\implies$$
</summary>

The implication operator $$\implies$$ is a
[binary truth function](https://en.wikipedia.org/wiki/Truth_function#Table_of_binary_truth_functions)
with the following [truth table](https://en.wikipedia.org/wiki/Truth_table)
(using [$$\top$$](https://en.wikipedia.org/wiki/Tee_(symbol)) for true
and [$$\bot$$](https://en.wikipedia.org/wiki/Up_tack) for false):

<figure markdown="block">

| $$P$$ | $$Q$$ | $$P \implies Q$$
|:-:|:-:|:-:
| $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-green}{\top}$$
| $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$
| $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$
| $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$
{:.table-with-vertical-border-after-column-2}

<figcaption markdown="span">
The definition of $$\implies$$.
</figcaption>
</figure>

The technical term for this operation is [material implication](https://en.wikipedia.org/wiki/Material_conditional)
in order to distinguish it from how we use the term "implication" in everyday language.
In logic, implication does not require [causation](https://en.wikipedia.org/wiki/Causality).
For example, $$7 \text{ is odd} \implies 3 \text{ is prime}$$ is a true statement.

</details>

<details markdown="block">
<summary markdown="span" id="logical-disjunction">
Logical disjunction $$\lor$$
</summary>

The [logical disjunction $$\lor$$](https://en.wikipedia.org/wiki/Logical_disjunction) ("or") is true
[if and only if](#if-and-only-if) one of the operands are true ($$\htmlClass{color-green}{\top}$$)
instead of false ($$\htmlClass{color-red}{\bot}$$):

<figure markdown="block">

| $$P$$ | $$Q$$ | $$P \lor Q$$
|:-:|:-:|:-:
| $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$
| $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$
| $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-green}{\top}$$
| $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$
{:.table-with-vertical-border-after-column-2}

<figcaption markdown="span">
The definition of $$\lor$$.
</figcaption>
</figure>

</details>


#### Solutions of squares

$$
\boxed{\, \forall\ a, b \in \mathbb{F}\ a^2 = b^2 \iff a = b \lor a = -b \, \vphantom{\large |}}
$$

$$
\begin{aligned}
a^2 = b^2 &\iff a^2 - b^2 = 0 && \textsf{subtracting } b^2 \textsf{ from both sides} \\
&\iff (a - b) \cdot (a + b) = 0 && \textsf{using distributivity and commutativity} \\
&\iff a - b = 0 \lor a + b = 0 && \textsf{using \href{#no-non-trivial-zero-divisors}{no non-trivial zero divisors}} \\
&\iff a = b \lor a = -b && \textsf{taking } b \textsf{ to the other side}
\end{aligned}
$$

<!-- --> $$\iff$$ stands for [material equivalence ("if and only if")](#if-and-only-if).
The above theorem states that any two elements which result in the same element when being squared
differ at most in their [sign](https://en.wikipedia.org/wiki/Sign_(mathematics))
(i.e. one is the additive inverse of the other if they are not equal).
Therefore, the equation $$x^2 = c$$ has at most two solutions for a given element $$c$$.
(If $$c = 0$$, there is only one solution, namely $$0$$,
and as we will see in the [next section](#quadratic-residues),
there is no solution for half of the non-zero elements.)
A different way to see this is that in a field,
the polynomial $$f(x) = x^2 - c$$ of degree two can have at most two solutions,
as mentioned but not yet proved [earlier](#why-multiplicative-groups-modulo-a-prime-are-cyclic).

<details markdown="block">
<summary markdown="span" id="yet-another-proof">
Yet another proof
</summary>

In the [field of integers modulo a prime $$p$$](#integers-modulo-p),
the only square roots of $$1$$ are $$1$$ and $$-1$$ due to [Euclid's lemma](#euclids-lemma)
as we saw [earlier](#miller-rabin-primality-test).
Thus:

$$
a^2 =_p b^2 \iff a^2 / b^2 =_p 1 \iff (a/b)^2 =_p 1 \iff a/b =_p ±1 \iff a =_p ±b
$$

</details>

The [following](#quadratic-residues) [three](#eulers-criterion) [sections](#square-roots)
are important to solve the equation of [elliptic curves](#elliptic-curves) of the form
[$$y^2 = x^3 + a \cdot x + b$$](#curve-equation) over a [finite field](#finite-fields).


### Quadratic residues

An integer $$a$$ is called a [quadratic residue](https://en.wikipedia.org/wiki/Quadratic_residue)
[modulo](#modulo-operation) $$m$$ if there exists an integer $$x$$ so that $$a =_m x^2$$.
If no such integer exists, $$a$$ is called a [quadratic non-residue](#non-quadratic-residue).
Just like $$1$$ is technically prime but [excluded from the set of prime numbers](#the-integer-1)
to make theorems involving prime numbers easier,
<!-- --> $$0$$ is technically a quadratic residue but excluded from the set of quadratic residues
to make theorems about quadratic residues and non-residues easier.
Given this definition and an odd prime number $$p$$,
there are as many quadratic residues modulo $$p$$ as quadratic non-residues modulo $$p$$.
As we saw in the [previous paragraph](#solutions-of-squares),
the square of an integer equals the square of its additive inverse in any [field](#field-axioms),
including the field [$$\mathbb{Z}_p$$](#field-notation).
Therefore, there are at most $$\frac{p - 1}{2}$$ quadratic residues modulo $$p$$:

$$
\begin{aligned}
1^2 &=_p (p - 1)^2 \\
2^2 &=_p (p - 2)^2 \\
&\enspace \vdots \\
(\frac{p - 1}{2})^2 &=_p (\frac{p + 1}{2})^2
\end{aligned}
$$

Since any two elements of the field which result in the same element when being squared
differ [at most in their sign](#solutions-of-squares),
these $$\frac{p - 1}{2}$$ squares are all different.
Not accounting for $$0$$, all the other $$\frac{p - 1}{2}$$ elements in $$\mathbb{Z}_p$$ are quadratic non-residues.

<details markdown="block">
<summary markdown="span" id="non-quadratic-residue">
Non-quadratic residue
</summary>

It would make much more sense to use the term "non-quadratic residue" instead of "quadratic non-residue"
for the integers which are not a residue of a [square number](https://en.wikipedia.org/wiki/Square_number).
[Gauss](https://en.wikipedia.org/wiki/Gauss) is to blame for this.
He's the one who introduced the terms "quadratic residue" and "quadratic non-residue"
(respectively their [Latin](https://en.wikipedia.org/wiki/Latin) sources "residua quadratica" and
["non-residua quadratica"](https://la.wikisource.org/wiki/Disquisitiones_arithmeticae/Sectio_quarta))
in his book [Disquisitiones Arithmeticae](https://en.wikipedia.org/wiki/Disquisitiones_Arithmeticae) in 1801.
These terms have been used since then,
often even without "quadratic" if it's clear from the context what "residue" and "non-residue" refer to.
Furthermore, "nonresidue" is frequently written without a [hyphen](https://en.wikipedia.org/wiki/Hyphen).

</details>

<details markdown="block">
<summary markdown="span" id="proof-using-group-theory">
Proof using group theory
</summary>

Given the [field](#field-axioms) [$$\mathbb{Z}_p$$](#field-notation) of integers modulo an odd prime $$p$$,
we denote its [multiplicative group](#multiplicative-groups),
which consists of all its elements except $$0$$, as [$$\mathbb{Z}_p^\times$$](#multiplicative-group-notations).
The squaring function $$f(x) =_p x^2$$ is a [group homomorphism](#homomorphisms)
because $$f(a \cdot b) =_p (a \cdot b)^2 =_p a^2 \cdot b^2 =_p f(a) \cdot f(b)$$.
As a consequence, the [image of this function](https://en.wikipedia.org/wiki/Image_(mathematics))
– the set of quadratic residues — is a [subgroup](#subgroups) of $$\mathbb{Z}_p^\times$$.
The [kernel](#kernel) $$\mathbb{K}_f$$ of this homomorphism is $$\{1, -1\}$$.
<!-- --> $$f$$ maps two inputs $$a$$ and $$b$$ to the same output [if and only if](#if-and-only-if)
they belong to the same [coset](#subgroup-cosets) $$\mathbb{K}_f$$:
<!-- --> $$a^2 =_p b^2 \iff a^2 / b^2 =_p 1 \iff (a / b)^2 =_p 1
\iff a / b \in \mathbb{K}_f \iff a \in \mathbb{K}_f \cdot b$$.
Since $$|\mathbb{K}_f| = 2$$ and all cosets are of the same size,
always two elements are mapped to the same output,
which means that half of all elements are quadratic residues.
This is no surprise since we already proved [earlier](#solutions-of-squares)
that every element of the [function's image](https://en.wikipedia.org/wiki/Image_(mathematics))
has exactly two [preimages](https://en.wikipedia.org/wiki/Image_(mathematics)#Inverse_image).

</details>

<details markdown="block">
<summary markdown="span" id="products-of-residues-and-non-residues">
Products of residues and non-residues
</summary>

The following table summarizes what you get
when you multiply quadratic residues and non-residues modulo an odd prime $$p$$:

<figure markdown="block">

| Factor 1 | · | Factor 2 | = | Product
|-
| Residue | | Residue | | Residue
| Residue | | Non-residue | | Non-residue
| Non-residue | | Residue | | Non-residue
| Non-residue | | Non-residue | | Residue

<figcaption markdown="span">

The possible products of residues and non-residues.

</figcaption>
</figure>

Given that multiplication of integers is [commutative](#commutative-groups),
there are [three cases to analyze](https://www.quora.com/Prove-the-product-of-two-quadratic-non-residues-is-a-quadratic-residue-mod-p-p-prime/answer/Yang-Yan-1):
1. **Residue · residue**:
   The set of quadratic residues is closed under multiplication because for any residues $$a^2$$ and $$b^2$$,
   their product $$a^2 \cdot b^2 =_p (a \cdot b)^2$$ is another quadratic residue.
   (We already saw in the [previous box](#proof-using-group-theory) that
   the quadratic residues form a [subgroup](#subgroups) of [$$\mathbb{Z}_p^\times$$](#multiplicative-group-notations).
   Since $$1^2 =_p 1$$, $$1$$ is a residue.
   And the inverse of a residue is another residue: $$(a^2)^{-1} =_p (a^{-1})^2$$.)
2. **Residue · non-residue**:
   Since $$\mathbb{Z}_p^\times$$ is a [multiplicative group](#multiplicative-groups),
   the function $$f(x) =_p a \cdot x$$ is a [permutation](#permutations) for any $$a \in \mathbb{Z}_p^\times$$
   (i.e. distinct inputs are mapped to [distinct outputs](#unique-result)).
   Since we know that exactly half of all elements in $$\mathbb{Z}_p^\times$$ are residues
   and that the product of two residues is another residue,
   the function $$f(x) =_p b \cdot x$$ has to map all non-residues to non-residues for any residue $$b$$.
   If just a single non-residue was mapped to a residue, more than half of all outputs would be residues.
3. **Non-residue · non-residue**:
   Since the product of a residue and a non-residue is a non-residue,
   the function $$f(x) =_p c \cdot x$$ has to map all non-residues to residues for any non-residue $$c$$.
   If just a single non-residue was mapped to a non-residue, more than half of all outputs would be non-residues.

The second point can also be proven as follows:
Let $$b$$ be a residue and $$c$$ be a non-residue.
If $$b \cdot c$$ was a residue, $$b^{-1} \cdot b \cdot c =_p c$$ would be a residue according to the first point,
which is a [contradiction](https://en.wikipedia.org/wiki/Proof_by_contradiction).
Therefore, $$b \cdot c$$ has to be a non-residue.

The second and the third case [can also be derived](https://www.quora.com/Prove-the-product-of-two-quadratic-non-residues-is-a-quadratic-residue-mod-p-p-prime/answer/Jack-Huizenga)
using our [advanced group concepts](#advanced-concepts):
Let $$\mathbb{S}_p$$ denote the subgroup of quadratic residues modulo the odd prime $$p$$,
then the quadratic non-residues are a [coset](#subgroup-cosets) of $$\mathbb{S}_p$$.
Let's call this coset of non-residues $$\mathbb{T}_p$$,
then $$\mathbb{S}_p \cdot s = \mathbb{S}_p$$ for any $$s \in \mathbb{S}_p$$,
and $$\mathbb{S}_p \cdot t = \mathbb{T}_p$$ for any $$t \in \mathbb{T}_p$$.
Now $$\mathbb{S}_p$$ can also be interpreted as a [kernel](#kernel),
where the resulting [quotient group](#quotient-groups) $$\mathbb{Z}_p^\times / \mathbb{S}_p$$
consists of the elements $$\mathbb{S}_p$$ and $$\mathbb{T}_p$$,
where $$\mathbb{S}_p$$ is the identity element and the [order of the group](#group-order) is $$2$$.
Since the [order](#element-order) of $$\mathbb{T}_p$$ cannot be greater than $$2$$,
we have $$\mathbb{T}_p \cdot \mathbb{T}_p = \mathbb{S}_p$$.
This means
that $$\mathbb{Z}_p^\times / \mathbb{S}_p \href{#group-isomorphisms}{\cong} \href{#additive-group-notations}{\mathbb{Z}_2^+}$$
as [groups of prime order are cyclic](#lagrange-consequences)
and [cyclic groups are isomorphic to the additive group of the same order](#isomorphism-of-cyclic-groups).

For the above table to be correct, $$0$$ has to be excluded from the set of quadratic residues.
Otherwise, a residue times a non-residue can result in a residue
because [$$0$$ times any number is $$0$$](#multiplication-by-zero).
|residues| = |non-residues| wouldn't hold either otherwise.

</details>


### Euler's criterion

Given an odd prime $$p$$, there's a simple formula for determining whether an integer $$a$$
is a [quadratic residue modulo $$p$$](#quadratic-residues):

$$
a^\frac{p - 1}{2} =_p \begin{cases}
1 &\text{if } a \text{ is a quadratic residue modulo } p \text{,} \\
-1 &\text{if } a \text{ is a quadratic non-residue modulo } p \text{,} \\
0 &\text{if } a \text{ is a multiple of } p \text{.}
\end{cases}
$$

This is known as [Euler's criterion](https://en.wikipedia.org/wiki/Euler%27s_criterion),
named after [Leonhard Euler](https://en.wikipedia.org/wiki/Leonhard_Euler) (1707 − 1783).
According to [Fermat's little theorem](#fermats-little-theorem),
<!-- --> $$a^{p - 1} - 1 =_p 0$$ for all integers $$a$$ which are coprime with $$p$$.
Since $$p$$ is odd, $$p - 1$$ is even.
Thus, the previous equation can be factored as follows:

$$
\big(a^\frac{p - 1}{2} - 1\big) \cdot \big(a^\frac{p - 1}{2} + 1\big) =_p 0
$$

For every $$a \in \mathbb{Z}_p$$ except $$0$$,
either the first or the second factor has to be $$0$$
because a field has [no non-trivial zero divisors](#no-non-trivial-zero-divisors).
If $$a$$ is a quadratic residue, there is an integer $$x$$ so that $$a =_p x^2$$.
Since Fermat's little theorem holds for $$x$$ as well, we have:

$$
a^\frac{p - 1}{2} =_p (x^2)^\frac{p - 1}{2} =_p x^{p - 1} =_p 1
$$

Therefore, the first factor is $$0$$ for the [$$\frac{p - 1}{2}$$](#quadratic-residues) quadratic residues modulo $$p$$.
Since $$f(a) =_p a^\frac{p - 1}{2} - 1$$ can be $$0$$ for at most $$\frac{p - 1}{2}$$ elements of the field
as mentioned [earlier](#why-multiplicative-groups-modulo-a-prime-are-cyclic),
the $$\frac{p - 1}{2}$$ quadratic non-residues make the second factor $$0$$.

<details markdown="block">
<summary markdown="span" id="more-intuitive-proof">
More intuitive proof
</summary>

Since $$p$$ is an odd prime, [$$\mathbb{Z}_p^\times$$](#multiplicative-group-notations)
is [cyclic](#why-multiplicative-groups-modulo-a-prime-are-cyclic) and its [order](#group-order) is even.
In a [cyclic group](#cyclic-groups) of even order,
an element $$A = G^a$$ is a [quadratic residue](#quadratic-residues)
[if and only if](#if-and-only-if) the exponent $$a$$ is even,
where $$G$$ is a [generator of the group](#group-generators).
The reason for this is that a quadratic residue is of the form $$A = X^2 = (G^x)^2 = G^{2 \cdot x}$$.
Since the [modulus](#modular-arithmetic) $$p - 1$$ of the [repetition ring](#repetition-ring) is even,
wrapping around cannot make an even exponent odd,
i.e. $$2 \cdot x \text{ \href{#modulo-operation}{mod} } p - 1$$ is still even.
This can be visualized as follows:

<figure markdown="block">
{% include_relative generated/eulers-criterion.embedded.svg %}
<figcaption markdown="span">

The cyclic group $$\mathbb{Z}_p^\times$$ with quadratic residues in green and quadratic non-residues in red.

</figcaption>
</figure>

If you repeat any element $$p - 1$$ times, you get the $$1$$.
For the elements of the form $$A = X^2$$, this is the case already after $$\frac{p - 1}{2}$$ repetitions.
All other elements need to be squared one more time to get there
(i.e. to have an exponent which is a multiple of $$p - 1$$).
As explained [earlier](#multiplicative-group-repetition-table),
the element midway through the cycle is $$-1$$.

</details>

<details markdown="block">
<summary markdown="span" id="legendre-symbol">
Legendre symbol
</summary>

[Adrien-Marie Legendre](https://en.wikipedia.org/wiki/Adrien-Marie_Legendre) (1752 − 1833)
introduced the following notation for [Euler's criterion](#eulers-criterion),
called the [Legendre symbol](https://en.wikipedia.org/wiki/Legendre_symbol):

$$
\left(\frac{a}{p}\right) =_p a^\frac{p - 1}{2}
$$

</details>

<details markdown="block">
<summary markdown="span" id="eulers-criterion-of-a-product">
Euler's criterion of a product
</summary>

Given two integers $$a$$ and $$b$$,
[Euler's criterion](#eulers-criterion) of their product equals the product of their Euler's criteria:
<!-- --> $$(a \cdot b)^\frac{p - 1}{2} =_p a^\frac{p - 1}{2} \cdot b^\frac{p - 1}{2}$$.
This makes it much easier to analyze whether the products of residues and non-residues
are [residues or non-residues](#products-of-residues-and-non-residues).

</details>


### Square roots

In the previous two sections, we learned what a [quadratic residue](#quadratic-residues) is
and how we can determine whether an element is a quadratic residue using [Euler's criterion](#eulers-criterion).
In this section, we want to compute a [square root](https://en.wikipedia.org/wiki/Square_root) $$x$$
of a quadratic residue $$a$$ [modulo](#modulo-operation) an odd prime $$p$$ so that $$x^2 =_p a$$.
As shown [earlier](#solutions-of-squares), a square root of a field element is unique up to its sign.
We use the [radical symbol](https://en.wikipedia.org/wiki/Radical_symbol)
and the [plus-minus sign](https://en.wikipedia.org/wiki/Plus%E2%80%93minus_sign) to write this as $$\sqrt{a} =_p ±x$$.
If $$p + 1$$ is divisible by $$4$$ (i.e. $$p =_4 3$$), we can compute the square root of $$a$$ as follows:

$$
\sqrt{a} =_p ±a^\frac{p + 1}{4}
\quad \textsf{because} \quad
\big(±a^\frac{p + 1}{4}\big)^2 =_p a^\frac{p + 1}{2} =_p a \cdot a^\frac{p - 1}{2}
\href{#eulers-criterion}{=_p} a \cdot 1 =_p a
$$

The following tool implements this calculation.
In practice, it's common to skip Euler's criterion
and to verify simply whether the square of the output is equal to the input.
If $$p + 1$$ is not divisible by $$4$$ (i.e. $$p =_4 1$$),
you can use the [Tonelli-Shanks algorithm](#tonelli-shanks-algorithm).
The box after that generalizes the Tonelli-Shanks algorithm [to composite moduli](#square-roots-modulo-composite-numbers),
and the last box of this chapter explains why computing square roots
is [as difficult as factorizing integers](#why-integer-factorization-isnt-more-difficult).
Since neither of them is relevant for our purposes, you can skip them both.

<div id="tool-integer-simple-square-roots"></div>

<details markdown="block">
<summary markdown="span" id="tonelli-shanks-algorithm">
Tonelli-Shanks algorithm
</summary>

The [Tonelli-Shanks algorithm](https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm),
named after [Alberto Tonelli](https://it.wikipedia.org/wiki/Alberto_Tonelli) (1849 − 1920)
and [Daniel Shanks](https://en.wikipedia.org/wiki/Daniel_Shanks) (1917 − 1996),
finds a [square root](#square-roots) $$x$$ of a [quadratic residue](#quadratic-residues) $$a$$
modulo any odd prime $$p$$ by repeatedly adjusting an initial guess
with the help of any quadratic non-residue $$b$$.
The best known algorithm for finding a quadratic non-residue is to compute [Euler's criterion](#eulers-criterion)
for random elements of the [field](#field-axioms) [$$\mathbb{Z}_p$$](#field-notation) until you find a non-residue.
Since [half of all elements are non-residues](#quadratic-residues),
it takes on average just two attempts to find a non-residue
(because this is a [geometric distribution](https://en.wikipedia.org/wiki/Geometric_distribution)
with a [success probability](https://en.wikipedia.org/wiki/Bernoulli_trial) of $$\frac{1}{2}$$).
Since $$p$$ is odd, $$p - 1$$ is even and can be written as $$2^c \cdot d$$,
where $$c > 0$$ and $$d$$ is odd.
Given that $$a$$ is a quadratic residue and $$b$$ is a quadratic non-residue, we have:

$$
\begin{aligned}
p - 1 &= 2^c \cdot d \\[2pt]
a^\frac{p - 1}{2} &=_p a^{2^{c - 1} \cdot d} =_p (a^d)^{(2^{c - 1})} =_p 1 \\[2pt]
b^\frac{p - 1}{2} &=_p b^{2^{c - 1} \cdot d} =_p (b^d)^{(2^{c - 1})} =_p -1
\end{aligned}
$$

We set $$x =_p a^\frac{d + 1}{2}$$ initially.
At the core of the algorithm is the expression $$(x^2 \cdot a^{-1})^{(2^e)}$$ with an exponent $$e$$.
When $$e = c - 1$$, the expression evaluates to $$(x^2 \cdot a^{-1})^{(2^{c - 1})}
=_p ((a^\frac{d + 1}{2})^2 \cdot a^{-1})^{(2^{c - 1})}
=_p (a^{d + 1} \cdot a^{-1})^{(2^{c - 1})} =_p (a^d)^{(2^{c - 1})} =_p 1$$.
Next, we want to decrement $$e$$ while making sure that the expression keeps evaluating to $$1$$.
If we can get $$e$$ to $$0$$ so that $$(x^2 \cdot a^{-1})^{(2^e)} =_p x^2 \cdot a^{-1} =_p 1$$,
then $$x$$ is a square root of $$a$$.
As explained when we discussed the [Miller-Rabin primality test](#miller-rabin-primality-test),
<!-- --> $$1$$ and $$-1$$ are the only possible square roots of $$1$$ modulo a prime number.
If the expression still evaluates to $$1$$ for an $$e$$ decremented by $$1$$,
we can keep decrementing $$e$$ if $$e$$ is still greater than $$0$$ without doing anything.
If, on the other hand, the expression evaluates to $$-1$$ for some $$e < c - 1$$,
we have to adjust the value of $$x$$ to keep the expression at $$1$$.
You get from $$-1$$ to $$1$$ with a factor of $$-1$$.
Since $$x$$ is raised to the $$2^{e + 1}$$-th power,
we look for a value $$y$$ such that $$y^{(2^{e + 1})} =_p -1$$.
As it turns out, $$y = (b^d)^{(2^{c - e - 2})}$$ does the trick
($$c - e - 2 ≥ 0$$ because $$e ≤ c - 2$$ at this point):
<!-- --> $$((b^d)^{(2^{c - e - 2})})^{(2^{e + 1})} =_p (b^d)^{(2^{c - 1})} =_p -1$$.
Therefore, multiplying $$x$$ by $$(b^d)^{(2^{c - e - 2})}$$ brings the expression back to $$1$$,
thereby maintaining our [loop invariant](https://en.wikipedia.org/wiki/Loop_invariant).
If we haven't reached $$e = 0$$, we decrement $$e$$ again.

The following tool implements the Tonelli-Shanks algorithm for arbitrarily large numbers.
To make the output deterministic, it searches for a quadratic non-residue in the natural order of the field's elements.
In an [adversarial context](#required-number-of-miller-rabin-rounds),
this can affect the performance of the algorithm negatively.
If $$c = 1$$, $$e = c - 1 = 0$$ immediately,
which means that the initial $$x$$ is the final $$x$$, and thus the search for a quadratic non-residue can be skipped.
The tool displays the adjusted $$x$$ only in the next row.
If the value in the third column is $$1$$ (in green),
the same $$x$$ is used in the next row and the value in the last column is ignored (in gray).
I included the ignored values in the last column anyway
so that you can see that the last column does not depend on the input $$a$$
and that it's easier to observe that each value in the last column is the square of the value above it.
When you step through the quadratic residues of the field with the buttons next to the input $$a$$,
you'll see that $$x$$ sometimes has to be adjusted in every step and other times not at all.
The algorithm presented here can be optimized in several ways.
For example, computing the multiplicative inverse of $$a$$ can be avoided
(see [Wikipedia](https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm#Core_ideas)),
but I think my version of the algorithm is the easiest one to understand.

<div id="tool-integer-tonelli-shanks-algorithm"></div>

</details>

<details markdown="block">
<summary markdown="span" id="square-roots-modulo-composite-numbers">
Square roots modulo composite numbers
</summary>

Given an integer $$a$$ and a composite modulus $$m$$, how can we compute an $$x$$ so that $$x^2 =_m a$$?
If we know the [prime factorization](#prime-factorization) $$\prod_{i=1}^l p_i^{e_i}$$ of $$m$$,
we can determine a square root modulo each of the factors
[since](#composite-groups) $$\mathbb{Z}_m \cong \mathbb{Z}_{p_1^{e_1}} \times … \times \mathbb{Z}_{p_l^{e_l}}$$,
and then use the [Chinese remainder theorem](#chinese-remainder-theorem) to revert the [isomorphism](#group-isomorphisms).
If we don't know the prime factorization of $$m$$, determining whether $$a$$ is a quadratic residue modulo $$m$$
and computing square roots modulo $$m$$ is generally (but not always)
[as difficult](#why-integer-factorization-isnt-more-difficult) as factorizing $$m$$.
[This fact](https://en.wikipedia.org/wiki/Quadratic_residuosity_problem)
is used in [some](https://en.wikipedia.org/wiki/Cocks_IBE_scheme)
[cryptosystems](https://en.wikipedia.org/wiki/Goldwasser%E2%80%93Micali_cryptosystem).
[So far](#tonelli-shanks-algorithm), we have discussed only how to compute a square modulo an odd prime $$p$$.
Modulo a [prime power](https://en.wikipedia.org/wiki/Prime_power) $$p^e$$ for some integer $$e ≥ 1$$,
there are several cases to consider, which I derived mostly myself:
- $$a =_{p^e} 0$$: $$x =_{p^e} cp^d$$, where $$d = \lceil \frac{e}{2} \rceil$$ and $$c \in \{0, 1, …, p^{e - d} - 1\}$$.
- $$a =_{p^e} p^b$$ for some integer $$b ≥ 1$$:
  If $$b$$ is even, $$x =_{p^e} ±(p^{b / 2} + cp^d)$$,
  where $$d = \operatorname{max}(\lceil \frac{e}{2} \rceil, e - \frac{b}{2} - (1 - p\ \href{#modulo-operation}{\%}\ 2))$$
  and $$c \in \{0, 1, …, p^{e - d} - 1\}$$,
  because $$x^2 =_{p^e} (p^{b / 2} + cp^d)^2 =_{p^e} p^b + 2 c p^{b/2 + d} + c^2 p^{2d} =_{p^e} a$$
  due to the previous choice of $$d$$.
  Otherwise, there are no square roots
  because $$p^b =_{p^e} x^2 \iff p^b + tp^e = p^b(1 + tp^{e-b}) = x^2$$ for some integer $$t$$.
  As the [prime factorization](#prime-factorization) of an integer is [unique](#unique-factorization-theorem),
  an integer has an integer square root [if and only if](#if-and-only-if)
  every exponent of its prime factorization is even.
  Since $$1 + tp^{e-b}$$ is not a multiple of $$p$$ (it is one off from a multiple of $$p$$),
  its prime factors don't include $$p$$, which leaves us with the odd exponent $$b$$ for the prime factor $$p$$.
  Thus, $$p^b(1 + tp^{e-b})$$ has no square roots among the integers.
- $$\operatorname{\href{#greatest-common-divisor}{gcd}}(a, p^e) = 0$$:
  - **$$p$$ is odd**: As we saw [earlier](#why-multiplicative-groups-modulo-a-power-of-an-odd-prime-are-cyclic),
    the [multiplicative group](#multiplicative-groups) modulo a power of an odd prime is [cyclic](#cyclic-groups),
    and [Euler's criterion](#eulers-criterion) can be generalized to any cyclic multiplicative group
    by replacing $$p - 1$$ with $$\href{#eulers-totient-function}{\varphi}(p^e)$$ in [this box](#more-intuitive-proof).
    With the same replacement, you can also generalize the [Tonelli-Shanks algorithm](#tonelli-shanks-algorithm)
    to any cyclic multiplicative group.
    Alternatively, you can ["lift"](https://en.wikipedia.org/wiki/Hensel%27s_lemma#Hensel_lifting)
    a solution modulo $$p^{e-1}$$ to modulo $$p^e$$ (recursively starting from $$p^1$$)
    as explained in section 12.5.2 of [Victor Shoup's book](https://shoup.net/ntb/ntb-v2.pdf).
  - **$$p$$ is even** (i.e. $$p = 2$$): This case is almost always ignored,
    and the [only algorithm I've found](https://www.johndcook.com/blog/quadratic_congruences/) had no explanation.
    Fortunately, we can derive an algorithm for powers of 2 with the following observations:
    1. If $$x^2 =_{p^e} a$$ (i.e. $$x^2 - a$$ is a multiple of $$p^e$$),
       then $$x^2 =_{p^d} a$$ for some positive integer $$d ≤ e$$
       because any multiple of $$p^e$$ is also a multiple of $$p^d$$.
    2. Whenever $$x^2 =_{p^e} a$$, $$-x$$ is also a solution because $$(-x)^2
       \href{#multiplication-by-minus-one}{=} ((-1)x)^2 = (-1)^2x^2
       \href{#multiplication-by-minus-one}{=} (-(-1))x^2 \href{#double-inverse-theorem}{=} x^2$$.
    3. Whenever $$x^2 =_{2^e} a$$, $$x + 2^{e-1}$$ is also a solution
       because $$(x + 2^{e-1})^2 =_{2^e} x^2 + 2x2^{e-1} + 2^{2(e-1)} =_{2^e} x^2$$.
    4. If $$e ≥ 3$$, $$x^2 =_{2^e} 1$$ has [exactly four solutions](https://math.stackexchange.com/a/845498/947937),
       namely $$1$$, $$1 + 2^{e-1}$$, $$-1$$, and $$-(1 + 2^{e-1}) =_{2^e} -1 + 2^{e-1}$$,
       as $$-2^{e-1} =_{2^e} 2^{e-1}$$.
       Since $$x^2 - 1 = (x + 1)(x - 1)$$ is a multiple of $$2^e$$ and $$(x + 1) - (x - 1) = 2$$,
       both $$x + 1$$ and $$x - 1$$ are even (if they both were odd, their product couldn't be a multiple of $$2^e$$),
       and one of them is not a multiple of $$4$$.
       Consequently, the other one has to be a multiple of $$2^{e-1}$$ for their product to be a multiple of $$2^e$$.
       Since the only multiples of $$2^{e-1}$$ modulo $$2^e$$ are $$0$$ and $$2^{e-1}$$, $$x$$ has to be next to them,
       which gives us the four aforementioned solutions.
    5. In the case of $$e = 3$$, the solutions of $$x^2 =_8 1$$ are $$1$$, $$3$$, $$5$$, and $$7$$
       according to the previous point, which you can verify with the [repetition table of multiplicative groups](#tool-table-multiplicative-group-repetition&modulus=8&coprime=false&repeat=true&order=false&totient=false).
       As you can also see, $$3$$, $$5$$, and $$7$$ have no square roots modulo $$8$$.
    6. Combined with the first observation, $$x^2 =_{2^e} a$$ for some $$e ≥ 3$$ has no solutions
       if $$a$$ is odd and $$a\ \%\ 8 ≠ 1$$.
    7. The integers which are coprime with the modulus (i.e. all odd integers in the case of $$m = 2^e$$)
       form a [multiplicative group](#multiplicative-groups).
       As we saw [earlier](#a-faster-algorithm-for-finding-a-generator),
       the [power function](#power-function-and-its-preimage) (squaring in this case) is a [homomorphism](#homomorphisms).
       As explained in the fourth observation, the size of its [kernel](#kernel) is $$4$$.
       Since a homomorphism maps two inputs to the same output
       if and only if they belong to the same [coset](#subgroup-cosets) of its kernel,
       an odd $$a$$ has either four square roots or none modulo $$2^e$$ for some $$e ≥ 3$$
       since all cosets contain the same number of elements as the kernel.
       Given a solution $$x$$, you obtain the other solutions by multiplying $$x$$ with each element of the kernel.
       Since the odd integer $$x$$ can be written as $$1 + b \cdot 2$$ for some integer $$b$$,
       <!-- --> $$x(1 + 2^{e-1}) =_{2^e} x + (1 + b \cdot 2)2^{e-1} =_{2^e} x + 2^{e-1} + b \cdot 2^e =_{2^e} x + 2^{e-1}$$,
       which matches our third observation.
    8. The four solutions $$x$$, $$x + 2^e$$, $$-x$$, and $$-x + 2^e$$ to $$x^2 =_{2^{e+1}} a$$ for an odd $$a$$
       and some $$e ≥ 3$$ are also solutions to $$x^2 =_{2^e} a$$ according to the first observation.
       In this case, however, $$x + 2^e =_{2^e} x$$ and $$-x + 2^e =_{2^e} -x$$,
       which means that the four solutions modulo $$2^{e+1}$$ map to two of the four solutions modulo $$2^e$$.
       Moreover, either $$x$$ or $$x + 2^e$$ modulo $$2^{e+1}$$ is already between $$0$$ and $$2^e$$, which means
       that one element stays the same when the two halves are mapped to one half by computing modulo $$2^e$$.
       The same is true for $$-x$$ and $$-x + 2^e$$ as well, which we can depict as follows:
       <div id="square-roots-modulo-power-of-2-target"></div>
    9. Given a solution $$x$$ to $$x^2 =_{2^e} a$$,
       either $$x$$ or $$x + 2^{e-1}$$ is also a solution to $$x^2 =_{2^{e+1}} a$$
       because the two solutions which $$x^2 =_{2^e} a$$ and $$x^2 =_{2^{e+1}} a$$ have in common
       differ in their sign and not by $$2^{e-1}$$ according to the previous point.
       <figure markdown="block">
       <table class="table-with-borders text-center">
          <thead>
            <tr>
              <th></th>
              <th colspan="2">$$±2^{e-1}$$</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2" class="align-middle">$$\cdot (-1)$$</td>
              <td class="background-color-red">$$x$$</td>
              <td class="background-color-green">$$x + 2^{e-1}$$</td>
            </tr>
            <tr>
              <td class="background-color-red">$$-x$$</td>
              <td class="background-color-green">$$-x + 2^{e-1}$$</td>
            </tr>
          </tbody>
        </table>
       <figcaption markdown="span" style="max-width: 635px;">
       When given any of the four solutions to $$x^2 =_{2^e} a$$, the initial solution may be in the wrong column.
       The row, on the other hand, doesn't matter: If $$x$$ isn't a solution to $$x^2 =_{2^{e+1}} a$$, then neither is $$2^e - x$$.
       </figcaption>
       </figure>

    These observations result in the following algorithm:
    Since $$\operatorname{gcd}(a, 2^e) = 0$$ in this branch, $$a$$ and any solution $$x$$ are odd.
    If $$e = 1$$, return $$\{1\}$$.
    If $$e = 2$$, return $$\{1, 3\}$$ if $$a =_4 1$$ and [$$\{\}$$](https://en.wikipedia.org/wiki/Empty_set) otherwise.
    (There are only two solutions in this case because $$x + 2 =_4 -x$$ for $$x \in \{1, 3\}$$.)
    If $$a\ \%\ 8 ≠ 1$$, return $$\{\}$$.
    Set $$x := 1$$.
    For $$i$$ from $$3$$ to $$e - 1$$, add $$2^{i-1}$$ to $$x$$ if $$x^2 ≠_{2^{i+1}} a$$.
    Return $$\{x, 2^{e-1} - x, 2^{e-1} + x, 2^e - x\}$$.
- $$\operatorname{gcd}(a, p^e) = p^b$$ for some integer $$b ≥ 1$$:
  This means that $$a =_{p^e} p^bc$$ for some integer $$c$$, where $$\operatorname{gcd}(c, p^e) = 0$$.
  You get the solutions by multiplying each solution $$x_1$$ to $$x^2 =_{p^e} p^b$$
  with each solution $$x_2$$ to $$x^2 =_{p^e} c$$.
  You find the solutions to these subproblems according to the previous two cases.
  Please note that these products are not all different from one another.
  Clearly, all these products are solutions to $$x^2 =_{p^e} a$$
  because $$(x_1x_2)^2 =_{p^e} x_1^2x_2^2 =_{p^e} p^bc =_{p^e} a$$.
  It's less obvious why these are the only solutions.
  Since $$p^bc =_{p^e} x^2 \iff p^bc + tp^e = p^b(c + tp^{e-b}) = x^2$$ for some integer $$t$$
  and $$c + tp^{e-b}$$ is not a multiple of $$p$$ because $$c$$ isn't a multiple of $$p$$,
  the prime factorization of $$x$$ has to include $$p$$ with an exponent of $$\frac{b}{2}$$.
  But as noted in the second case, solutions to $$x^2 =_{p^e} p^b$$ can be shifted by multiples of $$p^d$$.
  The other prime factors are determined by $$c + tp^{e-b} = x^2 \iff c =_{p^{e-b}} x^2$$,
  which means that you can use the solutions to $$x^2 =_{p^{e-b}} c$$ instead of the solutions to $$x^2 =_{p^e} c$$.

<figure markdown="block" id="square-roots-modulo-power-of-2-source">
{% include_relative generated/square-roots-modulo-power-of-2.embedded.svg %}
<figcaption markdown="span" style="max-width: 640px;">
The four solutions to $$x^2 =_{2^{e+1}} a$$ in green are mapped to two of the four solutions modulo $$2^e$$ in blue.
When given any of the four solutions in blue, you may have to add $$2^{e-1}$$ to obtain a solution in green.
</figcaption>
</figure>

The following tool computes the square roots of the given input modulo the specified composite integer as described above:

<div id="tool-integer-modular-square-roots"></div>

</details>

<details markdown="block">
<summary markdown="span" id="why-integer-factorization-isnt-more-difficult">
Why integer factorization isn't more difficult
</summary>

In the [previous box](#square-roots-modulo-composite-numbers),
we saw how the square roots modulo a composite number can be computed efficiently
if the [prime factorization](#prime-factorization) of the modulus is known.
This means that an efficient algorithm for factorizing integers would lead to an efficient algorithm
for computing the square roots modulo a composite number.
In this box, we show that the opposite is also true:
An efficient algorithm for computing the square roots modulo a composite number
would lead to an efficient algorithm for factorizing integers.
Being able to reduce each of these two [problems](https://en.wikipedia.org/wiki/Computational_problem)
to the other one efficiently (i.e. in [polynomial time](https://en.wikipedia.org/wiki/Time_complexity#Polynomial_time))
implies that these two problems are of similar [computational complexity](#computational-complexity-theory).
Since no efficient algorithm is known for either of these two problems,
both problems are believed to be difficult to solve for large inputs.

For the sake of simplicity, we assume that the number $$n$$, which we want to factorize,
is the product of two odd primes $$p$$ and $$q$$ (i.e. $$n = p \cdot q$$).
Since there are two solutions to $$x^2 =_p a$$ and two solutions to $$x^2 =_q a$$
as proven [earlier](#solutions-of-squares), there are four solutions to $$x^2 =_n a$$
because [$$\mathbb{Z}_n \cong \mathbb{Z}_p \times \mathbb{Z}_q$$](#composite-groups).
(Two of the solutions are the additive inverses of the other two.)
Since we haven't specified whether the algorithm has to find one square root of the given input $$a$$ or all of them,
there are two possibilities to consider:
- The efficient algorithm for computing square roots modulo a composite number [returns all four solutions](https://www.quora.com/How-is-the-theoretical-modular-square-root-on-composite-modulus-considered-equivalent-to-integer-factorization/answer/Senia-Sheydvasser):
  Compute the four square roots of an arbitrary [quadratic residue](#quadratic-residues) $$a$$, such as $$1$$.
  Choose distinct $$x$$ and $$y$$ from the four square roots so that $$x ≠_n -y$$.
  Since $$x^2 =_n y^2 =_n a$$, $$x^2 - y^2 = (x + y)(x - y)$$ is a multiple of $$n$$.
  However, $$n$$ divides neither $$x + y$$ (as $$x ≠_n -y$$) nor $$x - y$$ (as $$x ≠_n y$$),
  which means that $$p$$ has to divide one of the factors and $$q$$ the other.
  (If the prime factorization of one of these factors contained both $$p$$ and $$q$$, $$n$$ would divide this factor.)
  Therefore, $$\operatorname{gcd}(x ± y, n)$$,
  which can be computed efficiently with the [Euclidean algorithm](#euclidean-algorithm),
  equals either $$p$$ or $$q$$, which means that we have successfully factorized $$n$$.
- The efficient algorithm for computing square roots modulo a composite number [returns just one pair of solutions](https://www.quora.com/How-is-the-theoretical-modular-square-root-on-composite-modulus-considered-equivalent-to-integer-factorization/answer/Mark-Gritter):
  Choose a random $$x$$ between $$0$$ and $$n$$, and compute $$a =_n x^2$$.
  By feeding this value $$a$$ into the square-root-finding algorithm, you get a value $$y$$ so that $$y^2 =_n a$$.
  Since the value $$x$$ has been chosen randomly, the chance that $$y =_n ±x$$ is exactly 50%.
  If $$y =_n ±x$$, you repeat the process for another randomly chosen $$x$$ until $$x ≠_n ±y$$.
  Now again, $$\operatorname{gcd}(x ± y, n)$$ equals either $$p$$ or $$q$$.

</details>


## Elliptic curves (EC) {#elliptic-curves}
{:data-toc-text="Elliptic curves"}

[Elliptic curves](https://en.wikipedia.org/wiki/Elliptic_curve)
are the other popular way to construct [linear one-way functions](#linear-one-way-functions)
as they lead to shorter outputs and faster group operations than [multiplicative groups](#multiplicative-groups)
for the same [level of security](#bits-of-security).
Many cryptosystems which rely on the [discrete-logarithm problem](#discrete-logarithm-problem)
of multiplicative groups have been adapted to work over elliptic curves.
Since [elliptic-curve cryptography (ECC)](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)
is in practice always implemented with
[standardized elliptic curves](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography#Implementation),
we'll focus on how to work with given [curve parameters](#curve-parameters)
instead of&nbsp;how to come up with new parameters.
Unlike earlier chapters, this chapter covers just the bare minimum without any proofs.


### Curve equation

An elliptic curve consists of the [two-dimensional points](https://en.wikipedia.org/wiki/Two-dimensional_Euclidean_space)
whose $$x$$- and $$y$$-[coordinates](https://en.wikipedia.org/wiki/Coordinate_system)
satisfy the equation $$y^2 = x^3 + a \cdot x + b$$,
where $$a$$ and $$b$$ are the [parameters of the curve](#curve-parameters).
By an appropriate [change of variables](https://en.wikipedia.org/wiki/Change_of_variables) (see [below](#what-about-x2)),
almost any [cubic curve](https://en.wikipedia.org/wiki/Cubic_plane_curve) can be written in the above form,
which is known as the Weierstrass normal form,
named after [Karl Theodor Weierstrass](https://en.wikipedia.org/wiki/Karl_Weierstrass) (1815 − 1897).
The equation is defined over a [field](#field-axioms), to which $$a$$, $$b$$, and all coordinates belong.
Over the [real numbers](https://en.wikipedia.org/wiki/Real_number), an elliptic curve looks like this:

<figure markdown="block">
{% include_relative generated/elliptic-curve-continuous.embedded.svg %}
<figcaption markdown="span">
The curve $$y^2 = x^3 - x + 1$$ over the real numbers.
</figcaption>
</figure>

<details markdown="block">
<summary markdown="span" id="smoothness">
Smoothness
</summary>

For the group operation to be [well defined](https://en.wikipedia.org/wiki/Well-defined_expression)
(see the [next section](#point-addition)), the curve has to be [smooth](https://en.wikipedia.org/wiki/Smoothness),
which means every point on the curve has a unique [tangent](https://en.wikipedia.org/wiki/Tangent).
An elliptic curve is smooth ([non-singular](https://en.wikipedia.org/wiki/Singular_point_of_an_algebraic_variety))
if it has no [cusps](https://en.wikipedia.org/wiki/Cusp_(singularity)) and does not intersect itself.
This is the case [if and only if](#if-and-only-if) the [polynomial](https://en.wikipedia.org/wiki/Polynomial)
on the right-hand side of the equation has [no repeated roots](https://en.wikipedia.org/wiki/Square-free_polynomial),
which is the case if and only if its [discriminant](https://en.wikipedia.org/wiki/Discriminant#Degree_3)
<!-- --> $$-4a^3 - 27b^2$$ is not zero.
Let's look at two examples, where this is not the case:

<figure markdown="block">
{% include_relative generated/elliptic-curve-cusp.embedded.svg %}
<figcaption markdown="span">
When $$a = 0$$ and $$b = 0$$, we have $$y^2 = x^3$$ with a cusp at $$(0, 0)$$.
($$0$$ is a [root of multiplicity $$3$$](https://en.wikipedia.org/wiki/Multiplicity_(mathematics)#Multiplicity_of_a_root_of_a_polynomial).)
</figcaption>
</figure>

<figure markdown="block">
{% include_relative generated/elliptic-curve-intersection.embedded.svg %}
<figcaption markdown="span">
When $$a = -3$$ and $$b = 2$$, we have $$y^2 = x^3 - 3x + 2 = (x - 1)^2 (x + 2)$$.
($$1$$ is a root of multiplicity $$2$$.)
</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="what-about-x2">
What about x<sup>2</sup>?
</summary>

You may have noticed that the above equation defining elliptic curves misses the $$x^2$$ term.
The reason for this is that a [cubic polynomial](https://en.wikipedia.org/wiki/Cubic_function)
of the form $$c(z) = sz^3 + tz^2 + uz + v$$
can be turned into a so-called [depressed cubic](https://en.wikipedia.org/wiki/Cubic_equation#Depressed_cubic)
of the form $$d(x) = x^3 + ax + b$$ by replacing $$z$$ with $$x - \frac{t}{3s}$$,
thereby shifting the input, which means $$c(x - \frac{t}{3s}) = d(x) \iff c(z) = d(z + \frac{t}{3s})$$:

$$
\begin{aligned}
c(x - \frac{t}{3s}) &= s(x - \frac{t}{3s})^3 + t(x - \frac{t}{3s})^2 + u(x - \frac{t}{3s}) + v \\[8pt]
&= s(x^3 - 3\frac{t}{3s}x^2 + 3\frac{t^2}{3^2s^2}x - \frac{t^3}{3^3s^3})
+ t(x^2 - 2\frac{t}{3s}x + \frac{t^2}{3^2s^2}) + u(x - \frac{t}{3s}) + v \\[8pt]
&= sx^3 + ((-t) + t)x^2 + (\frac{t^2}{3s} - 2\frac{t^2}{3s} + u)x
+ (-\frac{t^3}{3^3s^2}) + \frac{t^3}{3^2s^2} - u\frac{t}{3s} + v \\[8pt]
&= sx^3 + \frac{3su - t^2}{3s}x + \frac{2t^3 - 9stu + 27s^2v}{27s^2}
\end{aligned}
$$

In order to get the promised form, we need to divide the polynomial by $$s$$, thereby scaling the output.
Therefore, we have:

$$
\begin{aligned}
a &= \frac{3su - t^2}{3s^2} \\[8pt]
b &= \frac{2t^3 - 9stu + 27s^2v}{27s^3}
\end{aligned}
$$

This [change of variable](https://en.wikipedia.org/wiki/Change_of_variables) doesn't work
if the polynomial is defined over a [finite field](#finite-fields)
whose so-called [characteristic](https://en.wikipedia.org/wiki/Characteristic_(algebra)) is $$3$$
because in this case, $$3s = 0$$, and [we cannot divide by $$0$$](https://en.wikipedia.org/wiki/Division_by_zero).
In the case of elliptic curves, there are even more terms to consider, such as $$xy$$,
which [you cannot get rid of](https://en.wikipedia.org/wiki/Elliptic_curve#Elliptic_curves_over_a_general_field)
if the characteristic of the underlying field is $$2$$.
As you can see, things become complicated quickly.

</details>


### Point addition

Together with the [point at infinity](#point-at-infinity), which we'll discuss in the next section,
the points on an elliptic curve form a [group](#group-axioms) under the operation described in this and the next section.
Even though this operation has nothing to do with [arithmetical addition](https://en.wikipedia.org/wiki/Addition),
it's called point addition, and it's written using the [additive notation](#notation).
I denote the $$x$$-coordinate of a point $$A$$ as $$A_x$$ and its $$y$$-coordinate as $$A_y$$, which means that
the point $$A$$ is defined by the [ordered pair](https://en.wikipedia.org/wiki/Ordered_pair) $$(A_x, A_y)$$.
Given two points $$A$$ and $$B$$ where $$A_x ≠ B_x$$, you get their sum $$C = A + B$$ by determining
where the [straight line](https://en.wikipedia.org/wiki/Line_(geometry)) which passes through $$A$$ and $$B$$
[intersects](https://en.wikipedia.org/wiki/Intersection) the elliptic curve for the third time
and then reflecting this point across the $$x$$ [axis](https://en.wikipedia.org/wiki/Axis_(mathematics)):

<figure markdown="block">
{% include_relative generated/elliptic-curve-addition.embedded.svg %}
<figcaption markdown="span">
The sum $$C$$ of $$A$$ and $$B$$ where $$A_x ≠ B_x$$.
</figcaption>
</figure>

As we will see in the [next section](#point-at-infinity),
the point $$-C = (C_x, -C_y)$$ is the [inverse](#group-axioms) of $$C$$.
Since the [curve equation](#curve-equation) is $$y^2 = x^3 + a \cdot x + b$$
and [$$y^2 = (-y)^2$$](#solutions-of-squares) in any [field](#field-axioms),
every elliptic curve is symmetric around the $$x$$ axis,
and thus $$C$$ is guaranteed to be on the curve as well.
In order to implement elliptic curves on a computer,
we have to work out the geometric operation [algebraically](https://en.wikipedia.org/wiki/Elementary_algebra),
i.e. as equations involving [variables](https://en.wikipedia.org/wiki/Variable_(mathematics)).
The [equation of a straight line](https://en.wikipedia.org/wiki/Line_(geometry)#In_Cartesian_coordinates)
is $$y = s \cdot x + t$$, where $$s$$ is the [slope](https://en.wikipedia.org/wiki/Slope) of the line
and $$t$$ is the value at which the line crosses the $$y$$ axis.
The slope of the line which passes through $$A$$ and $$B$$ is calculated as
the ratio of their vertical difference (marked as $$dy$$ in the graph above)
and their horizontal difference (marked as $$dx$$):

$$
s = \frac{dy}{dx} = \frac{B_y - A_y}{B_x - A_x} = \frac{A_y - B_y}{A_x - B_x}
$$

Since the formulas for $$C_x$$ and $$C_y$$ won't involve $$t$$, we don't have to determine its value.
The line through $$A$$ and $$B$$ intersects the elliptic curve
wherever they have the same $$y$$ value for the same $$x$$ value.
This means that the $$x$$-coordinate of any intersection point has to fulfill $$(sx + t)^2 = x^3 + ax + b$$,
which can be rewritten as $$x^3 - s^2x^2 + (a - 2sd)x + b - d^2 = 0$$.
Based on the geometric interpretation,
we know that the solutions of this equation are $$A_x$$, $$B_x$$, and $$C_x$$.
Since a value $$r$$ is a so-called [root](https://en.wikipedia.org/wiki/Zero_of_a_function)
of a [polynomial](https://en.wikipedia.org/wiki/Polynomial) $$f(x)$$ [if and only if](#if-and-only-if)
<!-- --> $$(x - r)$$ divides $$f(x)$$ (we'll discuss this in the article about coding theory,
see [Wikipedia](https://en.wikipedia.org/wiki/Polynomial#Solving_equations) for now),
we have $$x^3 \allowbreak \htmlClass{color-pink}{-} \allowbreak \htmlClass{color-pink}{s^2}x^2 + (a - 2sd)x + b - d^2
= (x - A_x)(x - B_x)(x - C_x)
= x^3 + \htmlClass{color-pink}{(-A_x - B_x - C_x)}x^2 + (A_xB_xC_x + A_xC_x + B_xC_x)x - A_xB_xC_x$$.
Since the [coefficients](https://en.wikipedia.org/wiki/Coefficient)
of two equal polynomials [are equal](https://en.wikipedia.org/wiki/Equating_coefficients),
we have $$\htmlClass{color-pink}{-s^2 = -A_x - B_x - C_x}$$, which we can solve for $$C_x$$:

$$
C_x = s^2 - A_x - B_x
$$

We get the value $$-C_y$$ by extrapolating the slope from $$A$$ or $$B$$:
<!-- --> $$-C_y = A_y + s(C_x - A_x) = B_y + s(C_x - B_x)$$.
Therefore:

$$
C_y = s(A_x - C_x) - A_y = s(B_x - C_x) - B_y
$$

Based on the geometric construction and these formulas,
it's apparent that this operation is [commutative](#commutative-groups), i.e. $$A + B = B + A$$.
We can move the points $$A$$ and $$B$$ closer and closer together until $$A = B$$,
at which point the line through $$A$$ and $$B$$ [becomes](https://en.wikipedia.org/wiki/Limit_(mathematics))
a [tangent](https://en.wikipedia.org/wiki/Tangent):

<figure markdown="block">
{% include_relative generated/elliptic-curve-tangent.embedded.svg %}
<figcaption markdown="span">
The sum $$D$$ of $$A$$ and $$A$$
(called [doubling](https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication#Point_doubling)).
</figcaption>
</figure>

Since in this case $$dx = B_x - A_x = 0$$, we can no longer compute the slope $$s$$ as $$\frac{dy}{dx}$$.
Instead, we have to differentiate the function $$f(x) = (x^3 + ax + b)^\frac{1}{2}$$,
whose [derivative](https://en.wikipedia.org/wiki/Derivative)
is $$f'(x) = \frac{1}{2}(x^3 + ax + b)^{-\frac{1}{2}}(3x^2 + a) = \frac{3x^2 + a}{2f(x)}$$
according to the [chain rule](https://en.wikipedia.org/wiki/Chain_rule).
We get the slope $$s'$$ of the tangent by evaluating $$f'$$ at $$A_x$$.
The coordinates of the point $$D$$ are then determined similarly to the point $$C$$ above:

$$
\begin{aligned}
s' &= \frac{3A_x^2 + a}{2A_y} \\[8pt]
D_x &= s'^2 - 2A_x \\
D_y &= s'(A_x - D_x) - A_y
\end{aligned}
$$

Please note that you can get a tangent not just by doubling a point.
The same tangent is used when determining $$(-D) + A = -A$$ with the previous set of equations.
In other words, the point $$-C$$ can be equal to the point $$A$$ or $$B$$ in the first graphic of this section.

<details markdown="block">
<summary markdown="span" id="associativity-of-point-addition">
Associativity of point addition
</summary>

In order to form a [group](#group-axioms), [point addition](#point-addition) has to be [associative](#group-axioms),
i.e. for any points $$A$$, $$B$$, and $$C$$, it has to be that $$(A + B) + C = A + (B + C)$$.
Unfortunately, it's rather difficult to prove that this is always the case.
You find explanations for this fact [here](https://books.google.ch/books?id=2_PLCQAAQBAJ&pg=PA14)
and [here](https://www.maths.tcd.ie/pub/Maths/Courseware/EllipticCurves/2016/Associativity.pdf).
I'll just visualize what associativity means geometrically:

<figure markdown="block">
{% include_relative generated/elliptic-curve-associativity.embedded.svg %}
<figcaption markdown="span">
No matter whether you add $$A + B$$ or $$B + C$$ first, you end up in the same spot when determining $$A + B + C$$.
</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="why-is-there-always-a-third-intersection">
Why is there always a third intersection?
</summary>

As explained [above](#point-addition), a point is at an intersection of an elliptic curve and a straight line
[if and only if](#if-and-only-if) its $$x$$-coordinate satisfies $$x^3 - s^2x^2 + (a - 2sd)x + b - d^2 = 0$$.
The left-hand side of this equation is a [cubic function](https://en.wikipedia.org/wiki/Cubic_function),
which crosses the $$x$$ axis at least once because it is [continuous](https://en.wikipedia.org/wiki/Continuous_function)
and goes from $$\href{https://en.wikipedia.org/wiki/Limit_(mathematics)}{f(-\infin)}
= \href{https://en.wikipedia.org/wiki/Infinity_symbol}{-\infin}$$ to $$f(\infin) = \infin$$ or vice versa.
This can be visualized as follows:

<figure markdown="block">
{% include_relative generated/cubic-function-1.embedded.svg %}
<figcaption markdown="span">
<!-- --> $$y = x^3 + x^2 + x + 1 = (x + 1)(x^2 + 1)$$
</figcaption>
</figure>

The cubic function $$x^3 + x^2 + x + 1$$ has only a single [root](https://en.wikipedia.org/wiki/Zero_of_a_function)
because its [factor](https://en.wikipedia.org/wiki/Polynomial#Factoring) $$x^2 + 1$$
has no roots among the [real numbers](https://en.wikipedia.org/wiki/Real_number)
(but $$i$$ and $$-i$$ among the [complex numbers](https://en.wikipedia.org/wiki/Complex_number)).
Other cubic functions cross the $$x$$ axis three times, which is apparent from their factors:

<figure markdown="block">
{% include_relative generated/cubic-function-3.embedded.svg %}
<figcaption markdown="span">
<!-- --> $$y = x^3 - x = (x + 1)x(x - 1)$$
</figcaption>
</figure>

Instead of crossing the $$x$$ axis again, a cubic function, such as $$x^3 - x^2 - x + 1$$,
can just "touch" the $$x$$ axis (at $$(1, 0)$$ in this case):

<figure markdown="block">
{% include_relative generated/cubic-function-2.embedded.svg %}
<figcaption markdown="span">
<!-- --> $$y = x^3 - x^2 - x + 1 = (x + 1)(x - 1)^2$$
</figcaption>
</figure>

As you can see from its factors, the root at $$x = 1$$ has a
[multiplicity](https://en.wikipedia.org/wiki/Multiplicity_(mathematics)#Multiplicity_of_a_root_of_a_polynomial) of $$2$$.
This has to be the case because when you factor out two roots from a [polynomial](https://en.wikipedia.org/wiki/Polynomial)
of [degree](https://en.wikipedia.org/wiki/Degree_of_a_polynomial) $$3$$,
you're left with a polynomial of degree $$1$$, which always has a root.
Therefore, a cubic function has either one or three real roots, which don't have to be distinct.
Since [point addition](#point-addition) involves two points (roots),
you're guaranteed to find a third point (root) on the same line,
where a [point of tangency](https://en.wikipedia.org/wiki/Tangent) is simply counted twice.

</details>

<details markdown="block">
<summary markdown="span" id="why-flip-the-intersection-over-the-x-axis">
Why flip the intersection over the x axis?
</summary>

If we [didn't reflect](https://crypto.stackexchange.com/questions/53974/when-adding-two-points-on-an-elliptic-curve-why-flip-over-the-x-axis)
the third intersection across the $$x$$ axis,
we would have $$A + B = C$$, $$A + C = B$$, and $$B + C = A$$
because the [collinearity](https://en.wikipedia.org/wiki/Collinearity) of the three points is symmetric
(i.e. if $$C$$ lies on the same line as $$A$$ and $$B$$, $$B$$ lies on the same line as $$A$$ and $$C$$):

<figure markdown="block">
{% include_relative generated/elliptic-curve-collinearity.embedded.svg %}
<figcaption markdown="span">
Three collinear points $$A$$, $$B$$, and $$C$$ with their reflections.
</figcaption>
</figure>

By inserting the value of $$B$$ from the second equation into the first equation, we would get $$A + (A + C) = C$$.
Assuming that point addition forms a [group](#group-axioms) (this is our goal after all),
<!-- --> $$A + A$$ would have to equal the [identity element](#group-axioms).
Since $$A$$ is an arbitrary point on the elliptic curve,
every point on the curve would have an [order](#element-order) of $$2$$,
which is not [what we want](#repetitions).
We can see this more directly by repeating an element $$D$$.
If $$D + D$$ equaled $$E$$, we would get back to $$D$$ by adding $$D$$ again, i.e. $$E + D = D$$:

<figure markdown="block">
{% include_relative generated/elliptic-curve-only-tangent.embedded.svg %}
<figcaption markdown="span">
The tangent at $$D$$ intersects the elliptic curve at $$E$$.
</figcaption>
</figure>

This would make any such point $$E$$ an [identity element](#group-axioms),
which contradicts the uniqueness of the identity element in a group.
Moreover, the modified operation would not be [associative](#associativity-of-point-addition),
which can be seen on the basis of the following [counterexample](https://en.wikipedia.org/wiki/Counterexample):

<figure markdown="block">
{% include_relative generated/elliptic-curve-no-associativity.embedded.svg %}
<figcaption markdown="span" style="max-width: 480px;">
How associativity is violated by the modified operation.
(I know that this graph is ugly, but it wasn't easy to keep all the intersections in the image.)
</figcaption>
</figure>

Now let's go back to the three collinear points $$A$$, $$B$$, and $$C$$ at the beginning of this box.
If $$A + B = C$$ and $$A + C = B$$, then $$A + B - C = A - B + C$$,
which works only if each element is its own inverse.
If, on the other hand, $$A + B = -C$$ and $$A + C = -B$$,
which corresponds to the [actual point addition above](#point-addition),
we get the same expression in both cases, namely $$A + B + C = O$$,
where $$O$$ is the identity element, which we'll discuss [next](#point-at-infinity).

</details>


### Point at infinity

Due to [closure](#group-axioms), we have to be able to add any two points together,
including a point and its opposite reflected across the $$x$$ axis.
In this case, however, the line which passes through them intersects the elliptic curve only twice
because every element of a field has [at most two roots](#solutions-of-squares).
Since a vertical line cannot be expressed as $$y = s \cdot x + t$$,
this does not violate the explanation of why you
[always find a third intersection](#why-is-there-always-a-third-intersection).
In order to give vertical lines a third intersection,
we introduce a special point,
which is known as the [point at infinity](https://en.wikipedia.org/wiki/Point_at_infinity)
and usually denoted by the capital letter $$O$$.
It is a single point which lies on every vertical line.
Since [parallel lines](https://en.wikipedia.org/wiki/Parallel_(geometry))
don't intersect in a normal [Euclidean plane](https://en.wikipedia.org/wiki/Two-dimensional_Euclidean_space),
elliptic curves are defined in a so-called [projective plane](https://en.wikipedia.org/wiki/Projective_plane),
where any two distinct lines intersect at exactly one point.
The point at infinity serves as the [identity element](#group-axioms) of our [group](#finite-groups).
The inverse of any element other than $$O$$ is its reflection across the $$x$$ axis, i.e. $$-A = (A_x, -A_y)$$.
The point at infinity is its own inverse, though, i.e. $$-O = O$$.
This is why you can't imagine $$O$$ to be at $$(0, \infin)$$,
unless you're willing to turn the plane into a [cylinder](https://en.wikipedia.org/wiki/Cylinder)
in order to make $$(0, -\infin) = (0, \infin)$$.
The idea of fitting a line through the points that we add breaks down anyway in the case of $$O$$.
By being the identity element, it results in itself when it is added to itself, i.e. $$O + O = O$$.
Therefore, don't imagine too much and simply treat $$O$$ as a special case.

<figure markdown="block">
{% include_relative generated/elliptic-curve-infinity.embedded.svg %}
<figcaption markdown="span">
<!-- --> $$A + (-A) = O$$, but also $$O + A = A$$ by reflecting the other intersection.
</figcaption>
</figure>

Where the elliptic curve crosses the $$x$$ axis,
the point of intersection is its own inverse,
and the tangent to the curve is vertical:

<figure markdown="block">
{% include_relative generated/elliptic-curve-zero.embedded.svg %}
<figcaption markdown="span">
<!-- --> $$B = -B$$ and $$B + B = O$$.
</figcaption>
</figure>

With different [parameters](#curve-parameters),
an elliptic curve can cross the $$x$$ axis more than once.
You find an example of this in the [first box below](#example-of-separated-curve).

<details markdown="block">
<summary markdown="span" id="example-of-separated-curve">
Example of separated curve
</summary>

An [elliptic curve](#curve-equation) separates into two components
if its [discriminant](https://en.wikipedia.org/wiki/Discriminant#Degree_3) $$-4a^3 - 27b^2$$ is positive:

<figure markdown="block">
{% include_relative generated/elliptic-curve-separated.embedded.svg %}
<figcaption markdown="span">
The curve $$y^2 = x^3 - x$$ (i.e. $$a = -1$$ and $$b = 0$$).<br>
This curve crosses the $$x$$ axis at $$x = -1 \textsf{, } 0 \textsf{, and } 1$$.
</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="pseudocode-for-point-addition">
Pseudocode for point addition
</summary>

We can combine the various cases of [point addition](#point-addition)
into the following [pseudocode](https://en.wikipedia.org/wiki/Pseudocode),
but make sure to read the warnings below:

$$
\text{const } a := … \\
\text{function } add(A, B)\ \{ \\
\quad \text{if }(A = O)\ \{ \\
\quad \quad \text{return } B \\
\quad \} \text{ else if }(B = O)\ \{ \\
\quad \quad \text{return } A \\
\quad \} \text{ else if }(A = -B)\ \{ \\
\quad \quad \text{return } O \\
\quad \} \text{ else } \{ \\
\quad \quad \text{let } s \\
\quad \quad \text{if }(A = B)\ \{ \\
\quad \quad \quad s := \frac{3A_x^2 + a}{2A_y} \\
\quad \quad \} \text{ else } \{ \\
\quad \quad \quad s := \frac{B_y - A_y}{B_x - A_x} \\
\quad \quad \} \\
\quad \quad \text{let } x := s^2 - A_x - B_x \\
\quad \quad \text{return new } Point(x, s(A_x - x) - A_y) \\
\quad \} \\
\}
$$
{:.pseudocode}

While this code works and is exactly how I implemented point addition for the tools in this chapter,
you should not use it for cryptographic purposes.
In order to avoid [timing attacks](https://en.wikipedia.org/wiki/Timing_attack),
cryptographic algorithms should run in [constant time](https://en.wikipedia.org/wiki/Timing_attack#Avoidance),
i.e. perform the same operations no matter the inputs.
How to achieve this is beyond the scope of this article.
[Common techniques](https://crypto.stackexchange.com/questions/86692/what-is-a-constant-time-work-around-when-dealing-with-the-point-at-infinity-fo)
include using [homogeneous/projective coordinates](https://en.wikipedia.org/wiki/Homogeneous_coordinates)
instead of [Cartesian coordinates](https://en.wikipedia.org/wiki/Cartesian_coordinate_system)
and working with [(twisted) Edwards curves](https://en.wikipedia.org/wiki/Twisted_Edwards_curve),
named after [Harold Mortimer Edwards](https://en.wikipedia.org/wiki/Harold_Edwards_(mathematician)) (1936 − 2020),
instead of [curves in Weierstrass form](#curve-equation).
The advantages of [Edwards curves](https://en.wikipedia.org/wiki/Edwards_curve)
are that the formulas for addition and doubling are the same
and that the [identity element](#group-axioms) is an ordinary point.

</details>


### Discrete curves

Elliptic curves as [presented so far](#curve-equation) are not suitable for computers
because computers can represent [real numbers](https://en.wikipedia.org/wiki/Real_number)
only with [limited precision](https://en.wikipedia.org/wiki/Floating-point_arithmetic),
which leads to [inaccuracies](https://en.wikipedia.org/wiki/Numerical_stability).
Fortunately, we can define elliptic curves also over [finite fields](#finite-fields),
using the same equations for [point addition](#point-addition) as before,
even though a [tangent](https://en.wikipedia.org/wiki/Tangent) is no longer
[well defined](https://en.wikipedia.org/wiki/Well-defined_expression).
The elliptic curve we used so far looks as follows over [$$\mathbb{F}_{19}$$](#field-notation):

<figure markdown="block">
{% include_relative generated/elliptic-curve-discrete.embedded.svg %}
<figcaption markdown="span">
The elliptic curve $$y^2 =_{19} x^3 - x + 1$$ over the field $$\mathbb{F}_{19}$$.
</figcaption>
</figure>

We can make several observations based on this example:
- **Symmetry**: The elliptic curve is still symmetric about the $$x$$ axis,
  i.e. if $$y$$ is a solution to the [curve equation](#curve-equation) for some value of $$x$$,
  then so is [$$-y$$ but no other value](#solutions-of-squares).
  Since $$-y$$ is usually represented as $$p - y$$ when computing [modulo](#modulo-operation) $$p$$,
  the symmetry that you see in the graph above is about $$y = \frac{p}{2} = 9.5$$ rather than about $$y = 0$$
  because the values from $$-9$$ to $$-1$$ are displayed above and not below the values from $$0$$ to $$9$$.
  If we ignore [extension fields](https://en.wikipedia.org/wiki/Field_extension),
  <!-- --> $$p$$ is odd, and thus either $$y$$ or $$p - y$$ is even while the other value is odd.
- **Gaps**: Not every element of a finite field has [square roots](#square-roots).
  If $$x^3 + a \cdot x + b$$ results in a [quadratic non-residue](#quadratic-residues),
  the elliptic curve has no points at such an $$x$$ value.
  In the example above, this is the case for $$x \in \{6, 7, 9, 10, 11, 14, 16, 17\}$$.
- **Order**: The point at $$(13, 0)$$ is its own inverse.
  Since its order is $$2$$, we know that this group has [an even number of points](#lagrange-consequences).
  (You will count only $$21$$ points, but you also have to include the [point at infinity](#point-at-infinity).)

<details markdown="block">
<summary markdown="span" id="counting-the-points-on-elliptic-curves">
Counting the points on elliptic curves
</summary>

The elements of an elliptic-curve group
are $$\{ (x, y) \in \href{https://en.wikipedia.org/wiki/Cartesian_product}{\mathbb{F} \times \mathbb{F}}
\mid y^2 = x^3 + a \cdot x + b \href{#logical-conjunction}{\land} 4a^3 + 27b^2 ≠ 0 \} \cup \{ O \}$$.
In order to determine the [group's order](#group-order),
we have to [count the points on the elliptic curve](https://en.wikipedia.org/wiki/Counting_points_on_elliptic_curves).
A naive approach of doing so is to determine for each possible $$x$$
whether $$x^3 + a \cdot x + b$$ is a [quadratic residue](#quadratic-residues).
If this is the case, you increase your counter by $$2$$.
If $$x^3 + a \cdot x + b = 0$$, you increase your counter by $$1$$.
However, this approach is [computationally infeasible](#computational-complexity-theory)
for the large [finite fields](#finite-fields)
that we need in [elliptic-curve cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography).
[René Schoof](https://en.wikipedia.org/wiki/Ren%C3%A9_Schoof) (born in 1955)
published an [efficient algorithm](https://en.wikipedia.org/wiki/Schoof%27s_algorithm)
for counting the points on elliptic curves over finite fields in 1985.
Unfortunately, his algorithm is too complicated for this introductory article.

</details>


### Point calculator

The following tool [implements point addition](#pseudocode-for-point-addition) and [repetition](#fast-repetitions) for
elliptic curves in [Weierstrass normal form](#curve-equation) over [prime fields](#integers-modulo-p) of arbitrary size.
If you want a visualization of point addition on [discrete curves](#discrete-curves),
you can use [this tool](https://andrea.corbellini.name/ecc/interactive/modk-add.html)
by [Andrea Corbellini](https://andrea.corbellini.name/about/).

<div id="tool-elliptic-curve-operations"></div>


### Operation table {#elliptic-curve-operation-table}

The following tool generates the [operation table](#additive-group-operation-table)
for elliptic curves in [Weierstrass normal form](#curve-equation)
over [prime fields](#integers-modulo-p) smaller than 100:

<div id="tool-table-elliptic-curve-operation"></div>

Since [point addition](#point-addition) is [commutative](#commutative-groups),
the above table is symmetric about the diagonal from the upper left to the lower right.
The tool highlights the [point at infinity](#point-at-infinity) with a green background
and elements which are their own inverse (i.e. elements whose $$y$$-coordinate is $$0$$) with a gray background.
Since inverses are displayed next to each other
and $$A + B = C$$ [implies that](#inversion-of-combination) $$(-A) + (-B) = (-C)$$,
you have two by two squares with inverses diagonally opposite of each other:

<figure markdown="block">

<table class="table-with-borders table-with-vertical-border-after-column-1 text-nowrap square-cells">
  <thead>
    <tr>
      <th>∘</th>
      <th>⋯</th>
      <th>B</th>
      <th>−B</th>
      <th>⋯</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>⋮</th>
      <td></td>
      <td>⋮</td>
      <td>⋮</td>
      <td></td>
    </tr>
    <tr>
      <th>A</th>
      <td>⋯</td>
      <td>C</td>
      <td>D</td>
      <td>⋯</td>
    </tr>
    <tr>
      <th>−A</th>
      <td>⋯</td>
      <td>−D</td>
      <td>−C</td>
      <td>⋯</td>
    </tr>
    <tr>
      <th>⋮</th>
      <td></td>
      <td>⋮</td>
      <td>⋮</td>
      <td></td>
    </tr>
  </tbody>
</table>

<figcaption markdown="span">
Symmetries within the operation table.
</figcaption>
</figure>


### Repetition table {#elliptic-curve-repetition-table}

Since the points on an elliptic curve together with the [point at infinity](#point-at-infinity)
form a [group](#group-axioms) under [point addition](#point-addition),
[repeatedly adding a point to itself](#element-repetitions),
which is known as [point multiplication](https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication),
generates a [subgroup](#subgroups),
whose order divides the [order of the group](#group-order) according to [Lagrange's theorem](#lagranges-theorem).
You can verify that this is the case for moduli up to 100 with the following tool:

<div id="tool-table-elliptic-curve-repetition"></div>

If you play around with the above tool, you can observe the following facts:
- **Non-cyclic groups**: Not all elliptic curves are [cyclic](#cyclic-groups).
  Example: [p = 7, a = 3, b = 0](#tool-table-elliptic-curve-repetition&p=7&a=3&b=0).
- **Groups of prime order**: There are elliptic curves whose order is prime,
  which is not possible in the case of [multiplicative groups](#multiplicative-groups).
  Example: [p = 7, a = 3, b = 5](#tool-table-elliptic-curve-repetition&p=7&a=3&b=5).
- **Elements of even order**: Whenever an element has an even [order](#element-order),
  the element at half its order is its own inverse and thus marked with a gray background.
  Example: [p = 7, a = 3, b = 1](#tool-table-elliptic-curve-repetition&p=7&a=3&b=1).


### Subgroup cosets {#elliptic-curve-subgroup-cosets}

For the sake of completeness,
the following tool shows the [cosets](#subgroup-cosets) of the [subgroup](#subgroups)
which is generated by the given point (see [above](#additive-group-subgroup-cosets)):

<div id="tool-cosets-elliptic-curve"></div>


### Elliptic-curve discrete-logarithm problem (ECDLP) {#elliptic-curve-discrete-logarithm-problem}
{:data-toc-text="Elliptic curve DLP"}

Similar to the [discrete-logarithm problem](#discrete-logarithm-problem)
of [multiplicative groups](#multiplicative-groups),
it's [believed](#computational-complexity-theory) that determining how many times a point
on an [elliptic curve](#curve-equation) has been repeated is computationally infeasible
if the [order of the point](#element-order) is large enough and the curve has no
[known weakness](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography#Domain_parameters).
This means that under the right conditions, you cannot find the coefficient $$k$$
so that $$kG = K$$ in a reasonable amount of time,
where $$G$$ is a [generator](#group-generators) and $$K$$ is an arbitrary point on the curve.
Since [many algorithms](#dl-algorithms) for finding the number of repetitions work
in multiplicative groups and on elliptic curves,
this [problem](https://en.wikipedia.org/wiki/Computational_problem) is still known as the discrete-logarithm problem,
even though "point-division problem" would be more accurate,
given that the [additive notation](#notation) is used for groups based on elliptic curves.


### Curve parameters

In [elliptic-curve cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography), an elliptic curve is defined
by the following [six parameters](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography#Domain_parameters):
- $$p$$ specifies the [prime field $$\mathbb{F}_p$$](#integers-modulo-p) over which the elliptic curve is defined.
- $$a$$ is the first parameter of the [curve equation](#curve-equation) $$y^2 = x^3 + a \cdot x + b$$.
- $$b$$ is the second parameter of the curve equation $$y^2 = x^3 + a \cdot x + b$$.
- $$G$$ is the [generator](#group-generators) which all users of a particular curve share.
- $$n$$ specifies the [order](#element-order) of $$G$$, i.e. $$n = \vert G \vert$$ and $$nG = O$$.
- $$h$$ is the [cofactor](#index-and-cofactor) of the [subgroup](#subgroups) generated by $$G$$.

As mentioned in the [previous section](#elliptic-curve-discrete-logarithm-problem), certain choices of parameters
have [known weaknesses](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography#Domain_parameters)
and should thus be avoided.
The bigger problem in the standardization of elliptic curves are potential weaknesses which are not yet publicly known.
Ideally, all parameters are chosen
[in a predictable manner](https://en.wikipedia.org/wiki/Nothing-up-my-sleeve_number)
in order to reduce the risk of a hidden [backdoor](https://en.wikipedia.org/wiki/Backdoor_(computing)).

<details markdown="block">
<summary markdown="span" id="curve-secp256k1">
Curve secp256k1
</summary>

[Bitcoin](https://en.wikipedia.org/wiki/Bitcoin), [Ethereum](https://en.wikipedia.org/wiki/Ethereum), and many
other [cryptocurrencies](https://en.wikipedia.org/wiki/Cryptocurrency) use an [elliptic curve](#elliptic-curves)
called [`secp256k1`](https://en.bitcoin.it/wiki/Secp256k1) in their signature algorithm,
which is defined in [Standards for Efficient Cryptography (SEC)](https://www.secg.org/sec2-v2.pdf)
by the [Standards for Efficient Cryptography Group (SECG)](https://www.secg.org/).
The letter `p` indicates that the curve is defined over a [prime field](#integers-modulo-p).
It is followed by the length of the [prime $$p$$](#curve-parameters) in [bits](/internet/#number-encoding).
The letter `k` stands for [Koblitz curve](https://www.iacr.org/archive/crypto2001/21390189.pdf),
named after [Neal Koblitz](https://en.wikipedia.org/wiki/Neal_Koblitz) (born in 1948),
which allows for especially efficient implementations.
The `1` at the end is just a sequence number.
`secp256k1` has the following [curve parameters](#curve-parameters)
in [hexadecimal notation](https://en.wikipedia.org/wiki/Hexadecimal)
(see [section 2.4.1 on page 9](https://www.secg.org/sec2-v2.pdf)):
- $$p =$$ [`FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFC2F`](#tool-integer-conversion&integer=FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFE+FFFFFC2F) $$= 2^{256} - 2^{32} - 2^{9} - 2^{8} - 2^{7} - 2^{6} - 2^{4} - 1$$
  (The proximity to $$2^{256}$$ allows for
  [faster implementations](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography#Fast_reduction_(NIST_curves))
  of the [modulo operation](#modulo-operation).)
- <!-- --> $$a = 0$$
- <!-- --> $$b = 7$$
- $$G =$$ ([`79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9 59F2815B 16F81798`](#tool-integer-conversion&integer=79BE667E+F9DCBBAC+55A06295+CE870B07+029BFCDB+2DCE28D9+59F2815B+16F81798), [`483ADA77 26A3C465 5DA4FBFC 0E1108A8 FD17B448 A6855419 9C47D08F FB10D4B8`](#tool-integer-conversion&integer=483ADA77+26A3C465+5DA4FBFC+0E1108A8+FD17B448+A6855419+9C47D08F+FB10D4B8))
- $$n =$$ [`FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE BAAEDCE6 AF48A03B BFD25E8C D0364141`](#tool-integer-conversion&integer=FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFE+BAAEDCE6+AF48A03B+BFD25E8C+D0364141)
- <!-- --> $$h = 1$$

You can click on the hexadecimal numbers to convert them to [decimal numbers](https://en.wikipedia.org/wiki/Decimal)
with the tool in the [next box](#integer-conversion).
You can [verify with the Miller-Rabin primality test](#tool-integer-miller-rabin-primality-test&input=FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFE+FFFFFC2F&candidates=&seed=0&rounds=64&abort=true)
that $$p$$ is indeed prime.
Given the above $$a$$ and $$b$$, the [curve equation](#curve-equation) is $$y^2 =_p x^3 + 7$$.
While [counting the points on elliptic curves](#counting-the-points-on-elliptic-curves) is complicated,
you can verify with the [point calculator](#point-calculator) above that [$$nG = O$$](#tool-elliptic-curve-operations&p=FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFE+FFFFFC2F&a=0&b=7&Ax=79BE667E+F9DCBBAC+55A06295+CE870B07+029BFCDB+2DCE28D9+59F2815B+16F81798&Ay=true&Bx=1&By=true&c=FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFE+BAAEDCE6+AF48A03B+BFD25E8C+D0364141)
(the tool also recovers the $$y$$-coordinate of $$G$$ correctly).
Since [$$p\ \%\ 4 = 3$$](#tool-integer-modulo&integer=FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFE+FFFFFC2F&modulus=4),
computing [square roots modulo $$p$$](#square-roots) is simple.
Since [$$n$$ is prime](#tool-integer-miller-rabin-primality-test&input=FFFFFFFF+FFFFFFFF+FFFFFFFF+FFFFFFFE+BAAEDCE6+AF48A03B+BFD25E8C+D0364141&candidates=&seed=0&rounds=64&abort=true)
and $$G$$ is not the [point at infinity](#point-at-infinity),
the [order of $$G$$](#element-order) cannot be smaller than $$n$$.
Since the [cofactor](#index-and-cofactor) is $$1$$, $$G$$ generates all points on the elliptic curve.
Since $$n$$ is prime, every element except $$O$$ [is a generator](#lagrange-consequences).
And since $$n$$ is odd, we know that the curve has [no point with a $$y$$-coordinate of $$0$$](#discrete-curves).

</details>

<details markdown="block">
<summary markdown="span" id="integer-conversion">
Integer conversion
</summary>

The following tools converts the given integer to the [decimal](https://en.wikipedia.org/wiki/Decimal)
and the [hexadecimal](https://en.wikipedia.org/wiki/Hexadecimal)
[numeral system](https://en.wikipedia.org/wiki/Numeral_system)
in the [preferred formatting](#formatting-preferences):

<div id="tool-integer-conversion"></div>

</details>


## DL algorithms

We now have two families of [finite groups](#finite-groups)
for which it is [presumably difficult](#computational-complexity-theory)
to determine how many times [an element has been repeated](#element-repetitions)
if the parameters of the group have been [chosen carefully](#pohlig-hellman-algorithm):
- [**Multiplicative groups**](#multiplicative-groups):
  Given a modulus $$m$$, a [generator](#group-generators) $$G$$, and an element $$K$$,
  it's hard to find the integer $$k$$ so that $$G^k =_m K$$.
- [**Elliptic curves**](#elliptic-curves):
  Given an elliptic curve, a generator $$G$$, and a point $$K$$,
  it's hard to find the integer $$k$$ so that $$kG = K$$.

In both groups, this is known as the [discrete-logarithm problem (DLP)](#discrete-logarithm-problem); in the latter case
also as the [elliptic-curve discrete-logarithm problem (ECDLP)](#elliptic-curve-discrete-logarithm-problem).
Since group operations are [associative](#group-axioms) and repeating an element [is fast](#fast-repetitions),
this gives us the [linear one-way function](#linear-one-way-functions) we were aiming for.
In this chapter, we'll study some of the best
[known algorithms for solving the discrete-logarithm problem](https://en.wikipedia.org/wiki/Discrete_logarithm#Algorithms).
This allows us to understand why the number of steps we need to solve a discrete-logarithm problem
is [in the order](https://en.wikipedia.org/wiki/Big_O_notation) of [the square root](#pollards-rho-algorithm)
of [the largest prime factor](#pohlig-hellman-algorithm) of the [generator's order](#element-order),
and why it's [even less](#index-calculus-algorithm) in the case of multiplicative groups.
Before we do so, we'll revisit how an element of a group can be [repeated efficiently](#fast-repetitions).
This gives you a better feeling for why one direction of the linear one-way function is so much easier than the other.


### Repetition revisited

As explained [earlier](#fast-repetitions),
repeating a [generator $$G$$](#group-generators) $$k$$ times takes just $$\log_2(k)$$ steps,
which corresponds to the [bit-length](https://en.wikipedia.org/wiki/Bit-length) of $$k$$.
The algorithm below uses the fact that one can "rebuild" a binary number by doubling, thereby shifting the current
[binary digits (bits)](https://en.wikipedia.org/wiki/Bit) one to the left, and by adding one, thereby setting the
[least-significant bit](https://en.wikipedia.org/wiki/Bit_numbering#Bit_significance_and_indexing) to $$1$$.
Using [subscripts](https://en.wikipedia.org/wiki/Subscript_and_superscript) to denote the $$l$$ bits of $$k$$
from right to left so that $$k = (k_{l-1} … k_0)_2 = \sum_{i = 0}^{l - 1} k_i2^i$$ and $$k_{l-1} = 1$$,
we can rebuild the positive integer $$k$$ in the coefficient or exponent of $$G$$
by combining the current result with itself and by combining it with $$G$$:

<div class="tabbed text-left pre-background" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
\text{function }binaryRepeat(G, k)\ \{ \\
\quad \text{let }K := G \\
\quad \text{for }(i\text{ from }l - 2\text{ to }0)\ \{ \\
\quad \quad K := 2K \\
\quad \quad \text{if }(k_i = 1)\ \{ \\
\quad \quad \quad K := K + G \\
\quad \quad \} \\
\quad \} \\
\quad \text{return } K \\
\} \\
$$

$$
\text{function }binaryRepeat(G, k)\ \{ \\
\quad \text{let }K := G \\
\quad \text{for }(i\text{ from }l - 2\text{ to }0)\ \{ \\
\quad \quad K := K^2 \\
\quad \quad \text{if }(k_i = 1)\ \{ \\
\quad \quad \quad K := K \cdot G \\
\quad \quad \} \\
\quad \} \\
\quad \text{return } K \\
\} \\
$$

</div>

This algorithm is similar to the one I covered [earlier](#non-recursive-algorithm),
but this time we work explicitly with a binary representation of $$k$$
and process its bits from the left to the right instead of the other way around.
The following tool implements this algorithm for [multiplicative groups](#multiplicative-groups)
and [elliptic curves](#elliptic-curves).
You can change which group is being displayed in all the remaining tools [by double-clicking on its tab](#notation).

<div class="tabbed" data-titles="Multiplicative group | Elliptic curve | Both" data-default="Multiplicative group" id="tool-discrete-logarithm-binary-repetition">
    <div id="tool-discrete-logarithm-multiplicative-group-binary-repetition"></div>
    <div id="tool-discrete-logarithm-elliptic-curve-binary-repetition"></div>
</div>

<details markdown="block">
<summary markdown="span" id="limitations-of-the-above-tool">
Limitations of the above tool
</summary>

The [above tool](#tool-discrete-logarithm-binary-repetition) shares its state with the other tools in this chapter.
Since some algorithms for solving the [discrete-logarithm problem](#discrete-logarithm-problem)
work only if the [order](#element-order) of the [generator](#group-generators) is known,
we have to determine it even in the tools that don't need it.
In order to [determine the order of an element](#determining-the-order-of-an-element),
you have to know the [prime factorization](#prime-factorization) of the [group's order](#group-order),
which is itself not always easy to determine.
Hence, the tools in this chapter have the following limitations:
- [**Multiplicative groups**](#multiplicative-groups):
  In order to determine the order of a multiplicative group,
  we have to evaluate [Euler's totient function](#eulers-totient-function) for its modulus $$m$$,
  which requires the [prime factorization](#prime-factorization) of $$m$$.
  If $$m$$ isn't prime, the tools in this chapter perform up to 100'000 rounds of
  [Pollard's rho factorization algorithm](#pollards-rho-factorization-algorithm),
  which is usually enough to factorize the product of two 35-bit primes, i.e. numbers with up to 21 decimal digits.
  If successful, it performs at most another 100'000 rounds of the same algorithm to factorize the group's order.
  If either of these factorizations fail, you have to enter the order of $$G$$ yourself,
  which gives you the option of choosing the modulus [in a smart way](#search-for-a-group-generator).
  If you just want to know the result of a [modular exponentiation](https://en.wikipedia.org/wiki/Modular_exponentiation),
  you can use the [calculator for rings](#tool-ring-operations) above,
  which doesn't have this limitation.
- [**Elliptic curves**](#elliptic-curves):
  Since I didn't implement [Schoof's algorithm](#counting-the-points-on-elliptic-curves),
  the tool counts the number of points only for elliptic curves whose modulus $$p$$ is smaller than 100'000.
  Once the order of the group has been determined, it also performs up to 100'000 rounds
  of Pollard's rho factorization algorithm in order to determine the order of $$G$$.
  If $$p$$ > 100'000 or the factorization fails, you have to enter the order of $$G$$ yourself,
  which you can determine with [SageMath](https://en.wikipedia.org/wiki/SageMath)
  as explained in the [next box](#how-to-use-the-playground-of-sagemath).
  If you just want to know the result of a
  [point multiplication](https://en.wikipedia.org/wiki/Elliptic_curve_point_multiplication),
  you can use the [point calculator](#point-calculator) above,
  which doesn't have this limitation.

</details>

<details markdown="block">
<summary markdown="span" id="how-to-use-the-playground-of-sagemath">
How to use the playground of SageMath
</summary>

[SageMath](https://en.wikipedia.org/wiki/SageMath) is an
[open-source](https://en.wikipedia.org/wiki/Free_and_open-source_software)
[software library](https://en.wikipedia.org/wiki/Library_(computing)) for mathematics.
You can use [its playground](https://sagecell.sagemath.org/)
for [many things](https://doc.sagemath.org/html/en/reference/index.html),
which includes computations on [elliptic curves over finite fields](https://doc.sagemath.org/html/en/reference/arithmetic_curves/sage/schemes/elliptic_curves/ell_finite_field.html)
(see the documentation of
[`cardinality`](https://doc.sagemath.org/html/en/reference/arithmetic_curves/sage/schemes/elliptic_curves/ell_finite_field.html#sage.schemes.elliptic_curves.ell_finite_field.EllipticCurve_finite_field.cardinality),
[`order`](https://doc.sagemath.org/html/en/reference/arithmetic_curves/sage/schemes/elliptic_curves/ell_point.html#sage.schemes.elliptic_curves.ell_point.EllipticCurvePoint_finite_field.order),
[`lift_x`](https://doc.sagemath.org/html/en/reference/arithmetic_curves/sage/schemes/elliptic_curves/ell_generic.html#sage.schemes.elliptic_curves.ell_generic.EllipticCurve_generic.lift_x),
and [`plot`](https://doc.sagemath.org/html/en/reference/plotting/sage/plot/plot.html#sage.plot.plot.plot)):

<div id="code-sagemath"></div>

</details>


### Exhaustive search

The simplest algorithm for solving the [discrete-logarithm problem](#discrete-logarithm-problem)
is to simply [try all possible values for $$k$$](https://en.wikipedia.org/wiki/Brute-force_search).
The effort for doing so scales exponentially with the [bit-length](https://en.wikipedia.org/wiki/Bit-length) of $$k$$.
The search for the input $$k$$ so that you get the output $$K$$ can be visualized as follows:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

<figure markdown="block">
{% include_relative generated/dlp-exhaustive-search-additive.embedded.svg %}
<figcaption markdown="span">
You simply count how many times you have to repeat the generator $$G$$ to reach the output $$K$$.
</figcaption>
</figure>

<figure markdown="block">
{% include_relative generated/dlp-exhaustive-search-multiplicative.embedded.svg %}
<figcaption markdown="span">
You simply count how many times you have to repeat the generator $$G$$ to reach the output $$K$$.
</figcaption>
</figure>

</div>

Please note that the above graphic is linear only for the coefficient/exponent of $$G$$.
If you ordered the elements on the line according to their value
(such as the $$x$$-coordinate in the case of [elliptic curve points](#point-addition)),
the steps in blue would look completely chaotic
(see the repetition tables of [multiplicative groups](#multiplicative-group-repetition-table)
and [elliptic curves](#elliptic-curve-repetition-table) for actual sequences).
The following tool implements exhaustive search for [multiplicative groups](#multiplicative-groups)
and [elliptic curves](#elliptic-curves).
The tool spends most of its time waiting so that you can actually see what's happening.
If you want the result as quickly as possible,
[set the delay to 0](#tool-discrete-logarithm-multiplicative-group-exhaustive-search&d=0),
in which case the tool updates its output only every 1 million steps.

<div class="tabbed" data-titles="Multiplicative group | Elliptic curve | Both" data-default="Multiplicative group">
    <div id="tool-discrete-logarithm-multiplicative-group-exhaustive-search"></div>
    <div id="tool-discrete-logarithm-elliptic-curve-exhaustive-search"></div>
</div>

<details markdown="block">
<summary markdown="span" id="output-not-in-generated-subgroup">
Output not in generated subgroup
</summary>

The tools in this chapter don't require that $$G$$ [generates](#group-generators) the whole [group](#finite-groups).
In the case of [multiplicative groups](#multiplicative-groups),
it can be desirable for $$G$$ to generate just a [subgroup](#subgroups)
so that its [order](#element-order) can be prime (as mentioned [earlier](#multiplicative-group-repetition-table))
and that the size of [cryptographic keys](https://en.wikipedia.org/wiki/Key_(cryptography))
and [signatures](https://en.wikipedia.org/wiki/Digital_signature)
can be smaller (as explained [later](#bits-of-security)).
Moreover, some [cryptosystems](https://en.wikipedia.org/wiki/Cryptosystem),
such as [RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem)),
use [non-cyclic groups](#cyclic-groups), which have no generators.
If $$G$$ doesn't generate the whole group,
you can set the output $$K$$ to an element which isn't in the subgroup generated by $$G$$.
While [subgroup membership can be tested easily in cyclic groups](#subgroup-membership-test-in-cyclic-groups),
I didn't implement this check because
there is no simple formula to determine whether an [elliptic curve](#elliptic-curves) is cyclic
and I had to handle failures anyway for non-cyclic groups.

</details>

<details markdown="block">
<summary markdown="span" id="subgroup-membership-test-in-cyclic-groups">
Subgroup membership test in cyclic groups
</summary>

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

<div markdown="block">

Given two elements $$G$$ and $$K$$ of a [cyclic group](#cyclic-groups),
there exists an integer $$k$$ so that $$kG = K$$
[if and only if](#if-and-only-if) $$(\href{#element-order}{\lvert G \rvert})K = O$$.
Proof:
- If $$kG = K$$, $$K \in \href{#group-generators}{⟨G⟩}$$.
  According to [Lagrange's theorem](#lagrange-consequences), $$\lvert K \rvert$$ divides $$\lvert G \rvert$$.
  Therefore, $$(\lvert G \rvert)K = O$$.
- If $$(\lvert G \rvert)K = O$$, $$\lvert K \rvert$$ divides $$\lvert G \rvert$$.
  Now, $$K$$ and $$\frac{\lvert G \rvert}{\lvert K \rvert}G$$ [generate](#group-generators)
  a [subgroup](#subgroups) of [order](#group-order) $$\lvert K \rvert$$.
  As proven [earlier](#all-subgroups-of-cyclic-groups-are-cyclic),
  a cyclic group has a single subgroup of order $$\lvert K \rvert$$.
  Thus, $$⟨K⟩ = ⟨\frac{\lvert G \rvert}{\lvert K \rvert}G⟩$$.
  Since $$K \in ⟨\frac{\lvert G \rvert}{\lvert K \rvert}G⟩$$,
  there exists an integer $$k$$ so that $$kG = K$$.

</div>

<div markdown="block">

Given two elements $$G$$ and $$K$$ of a [cyclic group](#cyclic-groups),
there exists an integer $$k$$ so that $$G^k = K$$
[if and only if](#if-and-only-if) $$K^{\href{#element-order}{\lvert G \rvert}} = I$$.
Proof:
- If $$G^k = K$$, $$K \in \href{#group-generators}{⟨G⟩}$$.
  According to [Lagrange's theorem](#lagrange-consequences), $$\lvert K \rvert$$ divides $$\lvert G \rvert$$.
  Therefore, $$K^{\lvert G \rvert} = I$$.
- If $$K^{\lvert G \rvert} = I$$, $$\lvert K \rvert$$ divides $$\lvert G \rvert$$.
  Now, $$K$$ and $$G^{\lvert G \rvert / \lvert K \rvert}$$ [generate](#group-generators)
  a [subgroup](#subgroups) of [order](#group-order) $$\lvert K \rvert$$.
  As proven [earlier](#all-subgroups-of-cyclic-groups-are-cyclic),
  a cyclic group has a single subgroup of order $$\lvert K \rvert$$.
  Thus, $$⟨K⟩ = ⟨G^{\lvert G \rvert / \lvert K \rvert}⟩$$.
  Since $$K \in ⟨G^{\lvert G \rvert / \lvert K \rvert}⟩$$,
  there exists an integer $$k$$ so that $$G^k = K$$.

</div>

</div>

</details>


### Baby-step giant-step

[Exhaustive search](#exhaustive-search) is very slow because it takes steps of size $$1$$.
If we take larger steps of size $$s$$ by repeatedly multiplying the current element by $$G^s$$ instead of $$G$$
([or](#notation) by adding $$sG$$ instead of $$G$$),
we jump over $$K$$ if $$k - 1$$ is not a multiple of $$s$$.
Instead of checking after each step whether we have reached $$K$$,
we can compute $$s - 1$$ neighbors of $$K$$ and check whether we have reached one of them:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

<figure markdown="block">
{% include_relative generated/dlp-giant-step-right-additive.embedded.svg %}
<figcaption markdown="span">
If the landing area consists of $$s$$ elements, we can take steps of size $$s$$ without missing it.
</figcaption>
</figure>

<figure markdown="block">
{% include_relative generated/dlp-giant-step-right-multiplicative.embedded.svg %}
<figcaption markdown="span">
If the landing area consists of $$s$$ elements, we can take steps of size $$s$$ without missing it.
</figcaption>
</figure>

</div>

Since you make giant steps (in blue) after a series of baby steps (in green),
this algorithm is known as [baby-step giant-step](https://en.wikipedia.org/wiki/Baby-step_giant-step).
As you may want to compute the discrete logarithm of several elements,
you typically compute the neighbors of $$G$$ instead of $$K$$
and then take the giant steps backwards from the current element $$K$$
so that you can reuse the computed neighbors in later runs:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

<figure markdown="block">
{% include_relative generated/dlp-giant-step-left-additive.embedded.svg %}
<figcaption markdown="span">
In the more common variant of the algorithm, you take the giant steps backwards instead of forwards.
</figcaption>
</figure>

<figure markdown="block">
{% include_relative generated/dlp-giant-step-left-multiplicative.embedded.svg %}
<figcaption markdown="span">
In the more common variant of the algorithm, you take the giant steps backwards instead of forwards.
</figcaption>
</figure>

</div>

To look up whether you have reached one of the green elements
in [constant time](https://en.wikipedia.org/wiki/Time_complexity#Constant_time),
you store these elements with their index in a [hash table](https://en.wikipedia.org/wiki/Hash_table).
If you have enough storage for $$\sqrt{n}$$ elements ($$n = \href{#element-order}{\lvert G \rvert}$$),
it takes $$\sqrt{n}$$ baby steps to compute them and at most $$\sqrt{n}$$ giant steps to reach one of them from $$K$$.
This is a massive improvement over [exhaustive search](#exhaustive-search),
which takes in the order of $$n$$ steps to find $$k$$,
assuming that $$k$$ was chosen randomly between $$0$$ and $$n$$.
The following tool implements the baby-step giant-step algorithm,
but it makes at most 99 baby steps for the sake of visualization.
If you're just interested in the result, you can use the [next algorithm](#pollards-rho-algorithm).

<div class="tabbed" data-titles="Multiplicative group | Elliptic curve | Both" data-default="Multiplicative group">
    <div id="tool-discrete-logarithm-multiplicative-group-baby-step-giant-step"></div>
    <div id="tool-discrete-logarithm-elliptic-curve-baby-step-giant-step"></div>
</div>


### Pollard's rho algorithm

In order to achieve an expected [running time](https://en.wikipedia.org/wiki/Time_complexity)
of $$\sqrt{n}$$ with [baby-step giant-step](#baby-step-giant-step),
you need to store $$\sqrt{n}$$ elements,
which requires an impossible amount of memory for practical values of $$n$$.
For example, if $$n$$ is a [256-bit number](#bits-of-security),
you'd have to store 2<sup>128</sup> · 256 [bits](https://en.wikipedia.org/wiki/Bit)
≈ 10<sup>40</sup> [bytes](https://en.wikipedia.org/wiki/Byte)
in the case of [elliptic curves](#elliptic-curves),
ignoring the overhead for the indexes and the [data structure](https://en.wikipedia.org/wiki/Data_structure).
For comparison, the [global data storage capacity](https://www.statista.com/statistics/1185900/worldwide-datasphere-storage-capacity-installed-base/) is around 10<sup>22</sup> bytes in 2022.
[Pollard's rho algorithm](https://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm_for_logarithms),
which is named after [John M. Pollard](https://en.wikipedia.org/wiki/John_Pollard_(mathematician)) (born in 1941),
achieves the same expected running time of $$\sqrt{n}$$ while storing only 2 elements and 4 indexes
by exploiting the [birthday paradox](#birthday-paradox).

Pollard's rho algorithm uses the following, [non-cryptographic](/email/#cryptographic-hash-functions)
["hash" function](https://en.wikipedia.org/wiki/Hash_function),
which maps the integers $$a$$ and $$b$$ to an element $$C$$:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
h(a, b) = aG + bK = C
$$

$$
h(a, b) = G^a \cdot K^b = C
$$

</div>

Once we find a [collision](https://en.wikipedia.org/wiki/Hash_collision),
i.e. inputs $$(a_1, b_1)$$ and $$(a_2, b_2)$$ where $$b_1 ≠_n b_2$$ so that $$h(a_1, b_1) = h(a_2, b_2)$$,
we can solve for $$k$$ as follows:

<div class="tabbed aligned" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

$$
\begin{aligned}
a_1G + b_1K &= a_2G + b_2K \\
b_1K - b_2K &= a_2G - a_1G \\
(b_1 - b_2)kG &= (a_2 - a_1)G \\
(b_1 - b_2)k &=_n a_2 - a_1
\end{aligned}
$$

$$
\begin{aligned}
G^{a_1} \cdot K^{b_1} &= G^{a_2} \cdot K^{b_2} \\
K^{b_1} / K^{b_2} &= G^{a_2} / G^{a_1} \\
(G^k)^{b_1 - b_2} &= G^{a_2 - a_1} \\
(b_1 - b_2)k &=_n a_2 - a_1
\end{aligned}
$$

</div>

If $$b_1 - b_2$$ is coprime with [$$G$$'s order](#element-order) $$n$$,
it has a [multiplicative inverse](#multiplicative-inverse-revisited),
and thus $$k =_n (a_2 - a_1) \cdot (b_1 - b_2)^{-1}$$.
As we'll see in the [next section](#pohlig-hellman-algorithm),
we typically run Pollard's rho algorithm only if $$n$$ is prime,
in which case $$b_1 - b_2 ≠_n 0$$ is guaranteed to be coprime with $$n$$.
If $$b_1 - b_2$$ is not coprime with $$n$$,
there are [several solutions](#least-common-multiple-and-0) for $$k$$,
and we have to test one after the other in order to find the discrete logarithm of $$K$$.
Depending on the [prime factorization](#prime-factorization) of $$n$$,
there can be quite a lot of solutions to check, unfortunately (see [below](#solving-modular-equations)).

We can use insights from [graph theory](https://en.wikipedia.org/wiki/Graph_theory) to find a collision.
First, we define a [sequence](https://en.wikipedia.org/wiki/Sequence) of elements $$S_i$$ with the following function:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative">

<figure class="mt-0 mb-3" markdown="block">

$$
S_{i+1} = f(S_i) = \begin{cases}
S_i + G &\text{if } (S_i)_x =_3 0 \text{,} \\
S_i + K &\text{if } (S_i)_x =_3 1 \text{,} \\
S_i + S_i &\text{if } (S_i)_x =_3 2 \text{.}
\end{cases}
$$

<figcaption markdown="span" style="max-width: 400px;">

In the case of [elliptic curves](#elliptic-curves),
we consider just the [$$x$$-coordinate](#point-addition) of each point when partitioning the elements into three sets.

</figcaption>
</figure>

$$
S_{i+1} = f(S_i) = \begin{cases}
S_i \cdot G &\text{if } S_i =_3 0 \text{,} \\
S_i \cdot K &\text{if } S_i =_3 1 \text{,} \\
S_i \cdot S_i &\text{if } S_i =_3 2 \text{.}
\end{cases}
$$

</div>

If [$$K$$ is in the subgroup generated by $$G$$](#output-not-in-generated-subgroup)
and we start with the [identity element](#group-axioms) as $$S_1$$,
all the elements $$S_i$$ of the sequence are in the [subgroup](#subgroups) [generated by $$G$$](#group-generators).
Since we're interested only in [finite groups](#group-order) with finitely many elements,
the sequence has to reach an element which was already encountered earlier at some point.
Since the next element of the sequence $$S_{i+1}$$ depends only on the previous element $$S_i$$,
the sequence repeats from there.
Such a sequence thus forms the [Greek letter ρ (rho)](https://en.wikipedia.org/wiki/Rho) with a tail and a cycle:

<figure markdown="block">
{% include_relative generated/pollards-rho-partial.embedded.svg %}
<figcaption markdown="span">
The sequence repeats at $$S_9 = S_3$$.
</figcaption>
</figure>

In general, the tail can be empty, and the cycle can consist of a single element, which the function $$f$$ maps to itself.
Now,
we can use [Floyd's cycle-finding algorithm](https://en.wikipedia.org/wiki/Cycle_detection#Floyd.27s_Tortoise_and_Hare),
named after [Robert W. Floyd](https://en.wikipedia.org/wiki/Robert_W._Floyd) (1936 − 2001),
to find two elements $$S_u$$ and $$S_v$$ in this sequence so that $$S_u = S_v$$ and $$u ≠ v$$.
The algorithm moves two elements with different speeds along the sequence.
Alluding to [one of Aesop's fables](https://en.wikipedia.org/wiki/The_Tortoise_and_the_Hare),
these elements are usually called the [tortoise](https://en.wikipedia.org/wiki/Tortoise)
and the [hare](https://en.wikipedia.org/wiki/Hare).
They both start at $$S_1$$, but whenever the tortoise makes one step, the hare makes two.
As a consequence, the hare is ahead until the tortoise enters the cycle as well.
Since the hare cannot jump over the tortoise as the distance between them decreases by one in each iteration,
the hare catches up to the tortoise until they meet again:

<figure markdown="block">
{% include_relative generated/pollards-rho-chase.embedded.svg %}
<figcaption markdown="span" style="max-width: 420px;">
If the hare (in red) is one element behind the tortoise (in orange),
they'll be at the same element (in green) after the next iteration.
</figcaption>
</figure>

Once the tortoise and the hare meet again, we have the collision that we were looking for.
In order to determine $$k$$, though,
we must represent each element of the sequence as $$h(a, b)$$ for some integers $$a$$ and $$b$$.
The sequence function $$f$$ has been chosen such that it's easy to keep track of $$a$$ and $$b$$:
After starting with $$S_1 = h(a, b) = G^a \cdot K^b$$ ([or](#notation) $$S_1 = aG + bK$$)
for some initial values of $$a$$ and $$b$$,
you add $$1$$ to $$a$$ if $$S_i =_3 0$$,
add $$1$$ to $$b$$ if $$S_i =_3 1$$,
and double both $$a$$ and $$b$$ if $$S_i =_3 2$$.
Using the [subscript](https://en.wikipedia.org/wiki/Subscript_and_superscript) $$1$$
to denote the values of the tortoise and the subcript $$2$$ to denote the values of the hare,
it's very unlikely that $$b_1 =_n b_2$$ because the hare travelled further than the tortoise.
In the rare case that $$b_1 =_n b_2$$, you can start over with different initial values for $$a$$ and $$b$$.
I implemented this only for the [Pohlig-Hellman algorithm](#pohlig-hellman-algorithm) in the next section.
In order to have a deterministic outcome, the tool below sets $$a$$ and $$b$$ to $$0$$ initially.

The following tool implements Pollard's rho algorithm.
It visualizes the chase of the tortoise and the hare if $$G$$'s order $$n ≤ 400$$ and there is a delay.
Since (without the visualization) you have to store only the current element $$C$$
with the corresponding integers $$a$$ and $$b$$ for both the tortoise $$\square_1$$ and the hare $$\square_2$$,
the algorithm requires only a very small and fixed amount of memory.
As we'll see in&nbsp;the [second box](#birthday-paradox),
it takes on average only around $$\sqrt{n}$$ iterations until $$C_1 = C_2$$.
Therefore, Pollard's rho algorithm has the same expected running time as [baby-step giant-step](#baby-step-giant-step)
and is usually preferable to the latter due to its minimal memory consumption.

<div class="tabbed" data-titles="Multiplicative group | Elliptic curve | Both" data-default="Multiplicative group" id="tool-discrete-logarithm-pollards-rho-algorithm">
    <div id="tool-discrete-logarithm-multiplicative-group-pollards-rho-algorithm"></div>
    <div id="tool-discrete-logarithm-elliptic-curve-pollards-rho-algorithm"></div>
</div>

<details markdown="block">
<summary markdown="span" id="solving-modular-equations">
Solving modular equations
</summary>

How can we solve an equation of the form $$a \cdot x =_m c$$ for $$x$$?
If $$a$$ has a [multiplicative inverse](#multiplicative-inverse-revisited) modulo $$m$$, $$x =_m c \cdot a^{-1}$$.
If $$a$$ has no multiplicative inverse, $$a \cdot x =_m c$$
has $$d = \operatorname{\href{#greatest-common-divisor}{gcd}}(a, m)$$ solutions in [$$\mathbb{Z}_m$$](#integers-modulo-m)
if $$c$$ is a multiple of $$d$$ and [no solution otherwise](#bezouts-identity)
as we saw [earlier](#least-common-multiple-and-0).
Using the [extended Euclidean algorithm](#extended-euclidean-algorithm),
we can find integers $$b$$ and $$n$$ so that $$d = a \cdot b + m \cdot n$$.
After multiplying both sides by $$c / d$$, we get $$c = a \cdot (b \cdot c / d) + m \cdot (n \cdot c / d)$$.
Modulo $$m$$, we have $$a \cdot (b \cdot c / d) =_m c$$,
which means that $$x =_m b \cdot c / d$$ is a solution to $$a \cdot x =_m c$$.
Since the $$d$$ solutions are equally apart, we get the other $$d - 1$$ solutions
by adding multiples of the offset $$o = m / d$$ to $$x$$.
The following tool does all of that for you:

<div id="tool-integer-modular-equation"></div>

</details>

<details markdown="block">
<summary markdown="span" id="birthday-paradox">
Birthday paradox
</summary>

The [birthday paradox](https://en.wikipedia.org/wiki/Birthday_problem) denotes the counterintuitive fact
that in a group of 23 people, it's likelier than not that at least two of them have the same birthday.
Since we're not interested in birthdays, we analyze this problem more generally:
When we put $$i$$ items randomly into $$n$$ buckets,
how likely is it that at least one bucket contains at least two items?
If $$i > n$$, the probability of this happening is $$1$$ according to the
[pigeonhole principle](https://en.wikipedia.org/wiki/Pigeonhole_principle).
If $$i ≤ n$$, we first analyze the probability $$\overline{P}(i, n)$$ that this is not happening,
i.e. the probability that all buckets contain at most one item.
The probability that the first item lands in an empty bucket is $$1$$.
For the second item, $$n - 1$$ of the $$n$$ buckets are still empty.
The probability of landing in one of those is $$\frac{n - 1}{n}$$.
Thus:

$$
\overline{P}(i, n) = \frac{n}{n} \cdot \frac{n - 1}{n} \cdot \frac{n - 2}{n} \cdot … \cdot \frac{n - i + 1}{n}
= \frac{n \cdot (n - 1) \cdot (n - 2) \cdot … \cdot (n - i + 1)}{n^i} = \frac{n\href{https://en.wikipedia.org/wiki/Factorial}{!}}{n^i(n - i)!}
$$

The probability that at least one bucket contains at least two items is then $$P(i, n) = 1 - \overline{P}(i, n)$$.
Applied to the birthday paradox, we have $$P(23, 365) = 1 - 365! / (365^{23}(365 - 23)!) =
\href{https://www.wolframalpha.com/input?i=1-365%21%2F%28365%5E23*%28365-23%29%21%29}{0.5073}$$.
So how is this related to [Pollard's rho algorithm](#pollards-rho-algorithm)?
If the function $$f(S_i)$$ gives us a random element in the subgroup generated by $$G$$ of [order](#group-order) $$n$$,
<!-- --> $$P(i, n)$$ describes how likely it is that $$f$$ returned at least one element twice after $$i$$ invocations.
Unlike the birthday paradox, we're not interested in the [median](https://en.wikipedia.org/wiki/Median)
but rather in the expected number of iterations $$E(n)$$ until we obtain an element twice.
The [expected value](https://en.wikipedia.org/wiki/Expected_value)
of a [random variable](https://en.wikipedia.org/wiki/Random_variable)
is determined as the sum of each possible outcome multiplied by the probability of this outcome.
The first possible outcome is that we get a repetition in the second iteration.
The probability that we get the element from the first iteration again in the second iteration is $$\frac{1}{n}$$.
The probability that we get the first repetition in the third iteration is the probability
that we don't get a repetition in the second iteration ($$\frac{n - 1}{n}$$) times the probability
that we get one of the first two elements in the third iteration ($$\frac{2}{n}$$).
The probability that we sample $$n$$ different elements and get the repetition only in the $$(n + 1)$$th iteration
is $$\frac{(n-1)!}{n^{n-1}} = \frac{n!}{n^n}$$.
Thus:

$$
\begin{aligned}
E(n) &= 2 \cdot \frac{1}{n} + 3 \cdot \frac{n - 1}{n} \cdot \frac{2}{n}
+ 4 \cdot \frac{n - 1}{n} \cdot \frac{n - 2}{n} \cdot \frac{3}{n} + … + (n + 1) \cdot \frac{n!}{n^n} \\[8pt]
&= \sum_{i=2}^{n+1} \frac{i \cdot (n - 1)! \cdot (i - 1)}{(n - i + 1)! \cdot n^{i - 1}}
= \sum_{i=2}^{n+1} \frac{i \cdot (i - 1)}{n - i + 1} \cdot \frac{n!}{(n - i)! \cdot n^i}
\end{aligned}
$$

This formula determines the colored area of the following outcome × probability table
by adding up the area of each column:

<figure markdown="block">
{% include_relative generated/sampling-until-repetition.embedded.svg %}
<figcaption markdown="span" style="max-width: 465px;">
The green area indicates the iteration in which the first repetition occurs.
The width of each column indicates how likely the particular outcome is.
As just explained, the width of each column is determined by $$\frac{n! (i - 1)}{(n - i + 1)! n^i}$$.
</figcaption>
</figure>

We can simplify $$E(n)$$ by summing over the rows instead of the columns.
After the first iteration, the probability that we need at least one more iteration is $$1$$.
After the second iteration, the probability that we didn't get a repetition
and thus need more iterations is $$\frac{n - 1}{n}$$.
After the third iteration, we have to multiply this probability times the probability
that the third element wasn't one of the first two: $$\frac{n - 1}{n} \cdot \frac{n - 2}{n}$$.
This gives us the following formula $$Q(n)$$ for the blue area in the above graphic:

$$
Q(n) = 1 + \frac{n - 1}{n} + \frac{n - 1}{n} \cdot \frac{n - 2}{n} + …
= \sum_{i=1}^{n} \frac{n!}{(n - i)! \cdot n^i} = \frac{n!}{n^n} \cdot \sum_{i=1}^{n} \frac{n^{n-i}}{(n - i)!}
$$

By adding $$1$$ for the green area, we have $$E(n) = 1 + Q(n)$$.
To approximate the value of $$Q(n)$$, we need another formula $$R(n)$$:

$$
R(n) = 1 + \frac{n}{n + 1} + \frac{n}{n + 1} \cdot \frac{n}{n + 2} + …
= \sum_{i=0}^{\infty} \frac{n! \cdot n^i}{(n + i)!} = \frac{n!}{n^n} \cdot \sum_{i=0}^{\infty} \frac{n^{n+i}}{(n + i)!}
$$

For sufficiently large $$n$$, $$Q(n) \approx R(n)$$ because the difference between $$\frac{n - 1}{n}$$
and $$\frac{n}{n + 1}$$ gets smaller and smaller as $$n$$ gets larger, and the addends from $$i = n + 1$$
to $$\infty$$ get vanishingly small as they are the product of lots of numbers smaller than $$1$$.
Using the [Taylor series](https://en.wikipedia.org/wiki/Taylor_series),
named after [Brook Taylor](https://en.wikipedia.org/wiki/Brook_Taylor) (1685 − 1731),
of the [exponential function](https://en.wikipedia.org/wiki/Exponential_function)
(i.e. $$e^n = \sum_{i=0}^{\infty} \frac{n^i}{i!}$$)
and [Stirling's formula](https://en.wikipedia.org/wiki/Stirling%27s_approximation),
named after [James Stirling](https://en.wikipedia.org/wiki/James_Stirling_(mathematician)) (1692 − 1770),
to approximate [factorials](https://en.wikipedia.org/wiki/Factorial)
(i.e. $$n! \approx \sqrt{2 \pi n}\frac{n^n}{\mathrm{e}^n}$$), we get:

$$
Q(n) + R(n)
= \frac{n!}{n^n} \cdot \Big( \sum_{i=1}^{n} \frac{n^{n-i}}{(n - i)!} + \sum_{i=0}^{\infty} \frac{n^{n+i}}{(n + i)!} \Big)
= \frac{n!}{n^n} \cdot \Big( \sum_{i=0}^{\infty} \frac{n^i}{i!} \Big)
= \frac{n!}{n^n} \cdot \mathrm{e}^n \approx \sqrt{2 \pi n}
$$

Therefore, $$Q(n) \approx \frac{1}{2} \sqrt{2 \pi n} = \sqrt{\frac{\pi}{2} n} \approx 1.25 \sqrt{n}$$
since $$\frac{1}{2} = \sqrt{\frac{1}{4}}$$,
which means that it takes [in the order of](https://en.wikipedia.org/wiki/Big_O_notation) $$\sqrt{n}$$ iterations until [you get a repetition when randomly sampling from $$n$$ elements](https://en.wikipedia.org/wiki/Birthday_problem#Average_number_of_people_to_get_at_least_one_shared_birthday).
The functions $$Q(n)$$ and $$R(n)$$ were introduced for this analysis
by [Donald Ervin Knuth](https://en.wikipedia.org/wiki/Donald_Knuth) (born in 1938)
in section 1.2.11.3 in the first volume of his book
[The Art of Computer Programming](https://en.wikipedia.org/wiki/The_Art_of_Computer_Programming).

While the function $$f(S_i)$$ used by [Pollard's rho algorithm](#pollards-rho-algorithm) isn't random,
it is random enough for $$\sqrt{n}$$ to be a really good estimate for how many steps are needed.
In order to make it easier for you to judge this, the [tool above](#tool-discrete-logarithm-pollards-rho-algorithm)
displays the number of steps that it took to find a repetition at the top
and the square root (sqrt) of $$G$$'s order $$n$$ below the problem statement.
The above [graphic depicting $$\rho$$](#figure-pollards-rho-partial)
showed only the elements in the sequence defined by the starting element and $$f(S_i)$$.
However, $$f(S_i)$$ maps any of the $$n$$ elements to a somewhat random other element.
No matter where you start, you get a first repetition and thus a cycle after around $$1.25 \sqrt{n}$$ steps on average.
The complete picture looks like this:

<figure markdown="block">
{% include_relative generated/pollards-rho-complete.embedded.svg %}
<figcaption markdown="span">
The $$n$$ elements are depicted as circles and the mappings defined by $$f(S_i)$$ as arrows.
</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="pollards-rho-factorization-algorithm">
Pollard's rho factorization algorithm
</summary>

We can apply [the same idea](#pollards-rho-algorithm) to [integer factorization](#prime-factorization).
Confusingly, this algorithm is also called
[Pollard's rho algorithm](https://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm).
Given a composite number $$n$$ and a [divisor](#divisor) $$d$$ of $$n$$,
we can use the function $$f(x) =_d x^2 + 1$$ to define a sequence of integers $$s_i$$, where $$s_{i+1} = f(s_i)$$.
Since we compute $$f(x)$$ [modulo](#modulo-operation) $$d$$, this function evaluates to at most $$d$$ different values.
If the sequence generated by $$f(x)$$ is random enough,
it revisits an already visited integer after around $$\sqrt{d}$$ iterations on average
as we saw in the [previous box](#birthday-paradox).
We can use [Floyd's cycle-finding algorithm](https://en.wikipedia.org/wiki/Cycle_detection#Floyd.27s_Tortoise_and_Hare)
to find two integers $$a$$ and $$b$$ so that $$a =_d b$$.
If $$a - b$$ is a multiple of $$d$$,
then so is $$\operatorname{\href{#greatest-common-divisor}{gcd}}(n, \lvert a - b \rvert)$$
because $$d$$ is a factor of $$n$$.
Now the problem is that we don't know $$d$$, otherwise we would have already found a factorization of $$n$$.
Instead of computing $$f(x)$$ modulo $$d$$ and checking whether $$a =_d b$$,
we can compute $$x^2 + 1$$ modulo $$n$$ and check whether $$\operatorname{gcd}(n, \lvert a - b \rvert) > 1$$.
Since we don't have to reduce $$f(x)$$ modulo any integer and the former condition still implies the latter,
the latter algorithm takes at most as many iterations of Floyd's cycle-finding algorithm as the former.
If $$\operatorname{gcd}(n, \lvert a - b \rvert) > 1$$ and $$a ≠_n b$$, $$\operatorname{gcd}(n, \lvert a - b \rvert)$$
is a [non-trivial divisor](https://en.wikipedia.org/wiki/Divisor#General) of $$n$$.
Since this algorithm no longer depends on $$d$$ and the above reasoning applies to all divisors of $$n$$,
the number of iterations it takes to find a factor of $$n$$ is expected
to be around the square root of the smallest prime factor of $$n$$.
We can implement Pollard's rho algorithm in [pseudocode](https://en.wikipedia.org/wiki/Pseudocode) as follows:

$$
\text{let } o := 1 \\
\text{function } f(x, n)\ \{ \\
\quad \text{return } (x^2 + o)\ \href{#modulo-operation}{\%}\ n \\
\} \\[16pt]
\text{function } factorize(n)\ \{ \\
\quad \text{let } a := 2 \\
\quad \text{let } b := 2 \\
\quad \text{let } d := 1 \\
\quad \text{while }(d = 1)\ \{ \\
\quad \quad a := f(a, n) \\
\quad \quad b := f(f(b, n), n) \\
\quad \quad d := \operatorname{gcd}(n, \lvert a - b \rvert) \\
\quad \} \\
\quad \text{if }(d = n)\ \{ \\
\quad \quad \text{return \textquotedblleft failure\textquotedblright} \\
\quad \} \text{ else } \{ \\
\quad \quad \text{return } d \\
\quad \} \\
\} \\
$$
{:.pseudocode}

Usually, this algorithm finds the smallest prime factors of $$n$$ first,
but the returned $$d$$ can be any divisor of $$n$$ and doesn't have to be prime.
If you want to find the [prime factorization](#prime-factorization) of $$n$$,
you [recursively](https://en.wikipedia.org/wiki/Recursion_(computer_science))
factorize $$d$$ and $$\frac{n}{d}$$ until all factors are prime,
which you can test efficiently with a [probabilistic primality test](#probabilistic-primality-tests),
such as the [Miller-Rabin primality test](#miller-rabin-primality-test).
If $$a =_n b$$, $$\operatorname{gcd}(n, \lvert a - b \rvert) = n$$, and the algorithm fails.
In this case, you can increment the offset $$o$$ in the function $$f(x)$$ and try again.
If the input $$n = 4$$, neither incrementing $$o$$ nor starting from a different value makes the algorithm succeed.
For this reason, it's common to halve the input $$n$$ until it is odd
and then to run Pollard's rho factorization algorithm from there.

Pollard's rho factorization algorithm can be optimized in the following two ways:
- Use [Brent's cycle-finding algorithm](https://en.wikipedia.org/wiki/Cycle_detection#Brent.27s_algorithm),
  named after [Richard Peirce Brent](https://en.wikipedia.org/wiki/Richard_P._Brent) (born in 1946):
  Instead of moving both the tortoise and the hare along the sequence in each iteration,
  you move only the hare one step ahead, replacing three evaluations of $$f(x)$$ with one.
  After every power of $$2$$ steps, you set the tortoise to the current value of the hare.
  The tortoise then acts as a waypoint so that it can stop the hare when it passes by.
  While Brent's cycle-finding algorithm evaluates $$f(x)$$ as often as Floyd's one does in the worst case,
  [Brent showed](https://maths-people.anu.edu.au/~brent/pd/rpb051i.pdf)
  that his algorithm requires 36% fewer evaluations of $$f(x)$$ on average.
- [Combine several differences](https://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm#Variants)
  before running the [Euclidean algorithm](#euclidean-algorithm):
  Instead of computing the [greatest common divisor](#greatest-common-divisor) in every iteration,
  you compute the product of the differences $$\lvert a - b \rvert$$ modulo $$n$$ over several iterations
  and run the Euclidean algorithm only once in a while.
  This works because if $$\operatorname{gcd}(n, x) > 1$$,
  then $$\operatorname{gcd}(n, x \cdot y) > 1$$ for any integers $$x$$ and $$y$$.

The following tool implements Pollard's rho factorization algorithm.
Unlike [my implementation of trial division](#tool-integer-factorization-trial-division) above,
it checks whether the remaining factor is prime.
Its [running time](https://en.wikipedia.org/wiki/Time_complexity)
is thus [in the order of](https://en.wikipedia.org/wiki/Big_O_notation)
the [square root](https://en.wikipedia.org/wiki/Square_root) of the second largest prime factor
if the exponent of the largest prime factor is $$1$$.
(It's possible to test for [perfect powers](https://en.wikipedia.org/wiki/Perfect_power) efficiently
as explained in the note 3.6 in the [Handbook of Applied Cryptography](https://cacr.uwaterloo.ca/hac/about/chap3.pdf)
and [on Wikipedia](https://en.wikipedia.org/wiki/Perfect_power#Detecting_perfect_powers);
I just didn't implement this because you rarely encounter them.)

<div id="tool-integer-factorization-pollards-rho"></div>

</details>


### Pohlig-Hellman algorithm

The [Pohlig-Hellman algorithm](https://en.wikipedia.org/wiki/Pohlig%E2%80%93Hellman_algorithm),
which is named after [Stephen Pohlig](https://en.wikipedia.org/wiki/Stephen_Pohlig) (1953 − 2017)
and [Martin Edward Hellman](https://en.wikipedia.org/wiki/Martin_Hellman) (born in 1945),
reduces the [discrete-logarithm problem](#discrete-logarithm-problem)
in a large [group](#finite-groups) of non-prime [order](#group-order)
to several discrete-logarithm problems in smaller groups, which are easier to solve
since the [running time](https://en.wikipedia.org/wiki/Time_complexity)
of the above [DL algorithms](#dl-algorithms) depend only on the size of the group.
Given a [generator](#group-generators) $$G$$, its [order](#element-order) $$n$$,
and an output $$K$$ of the [linear one-way function](#linear-one-way-functions),
the Pohlig-Hellman algorithm finds the input $$k$$ as follows:

<div class="tabbed" data-titles="Additive | Multiplicative | Both" data-default="Multiplicative" markdown="block">

1. Find the [prime factorization](#prime-factorization) of $$n$$ so that $$n = p_1^{e_1} \cdot … \cdot p_l^{e_l}$$
   for distinct primes $$p_i$$ and integers $$e_i ≥ 1$$.
   Since the Pohlig-Hellman decomposition succeeds only if all the prime factors are sufficiently small,
   [Pollard's rho factorization algorithm](#pollards-rho-factorization-algorithm) is a good choice for this step.
   If the factorization fails because some factors are too large, the steps below wouldn't work either.
2. For $$i$$ from $$1$$ to $$l$$, do the following:
   1. Compute $$G_i := (n/p_i^{e_i})G$$.
      Since the order of $$G$$ is $$n$$, the order of $$G_i$$ is $$p_i^{e_i}$$.
   2. Compute $$K_i := (n/p_i^{e_i})K$$.
      Since $$kG = K$$, we have that $$K_i = (n/p_i^{e_i})kG = k(n/p_i^{e_i})G = kG_i$$,
      which means that the discrete logarithm of $$K$$ to the base $$G$$
      is also a discrete logarithm of $$K_i$$ to the base $$G_i$$.
      As we saw [earlier](#repetition-ring), a discrete logarithm is unique only up to the order of its base.
      Therefore, the discrete logarithm of $$K_i$$ to the base $$G_i$$, which I denote as $$k_i$$,
      is not necessarily a discrete logarithm of $$K$$ to the base $$G$$
      as $$k_i \in \{0, …, p_i^{e_i} - 1\}$$, whereas $$k \in \{0, …, n - 1\}$$.
      A discrete logarithm is unique up to the order of its base, though, which implies that $$k =_{p_i^{e_i}} k_i$$.
      <div class="mt-2" markdown="span">
      Instead of determining $$k$$ so that $$kG = K$$ in the original group of order $$n$$,
      we can thus determine $$k_i$$ so that $$k_iG_i = K_i$$ in&nbsp;the [subgroup](#subgroups)
      [generated](#group-generators) by $$G_i$$ of order $$p_i^{e_i}$$, which improves the expected running time
      from $$\sqrt{n}$$ to $$\sqrt{p_i^{e_i}}$$ when using [Pollard's rho algorithm](#pollards-rho-algorithm) for this.
      Depending on the prime factorization of $$n$$, this can already be a big improvement.
      The following insight allows us to determine $$k_i$$ in the steps 2.3 to 2.5 below
      without ever having to compute a discrete logarithm in a group larger than $$p_i$$,
      which improves the expected running time even further to $$\sqrt{p_i}$$.
      If you're not interested in this, you can continue with the step 3 at the bottom of this box.
      </div>
      <div class="mt-2" markdown="span">
      **Insight**: We can write $$k_i$$ in [base](https://en.wikipedia.org/wiki/Radix) $$p_i$$ as
      <!-- --> $$k_i = d_0 + d_1p_i + d_2p_i^2 + … + d_{e_i-1}p_i^{e_i-1} = \sum_{j=0}^{e_i-1} d_jp_i^j$$,
      where each digit $$d_j \in \{0, …, p_i - 1\}$$.
      Now, $$k_iG_i = (d_0 + d_1p_i + … + d_{e_i-1}p_i^{e_i-1})G_i
      = \htmlClass{color-red}{d_0G_i + d_1p_iG_i + … + d_{e_i-1}p_i^{e_i-1}G_i = K_i}$$.
      When we multiply both sides by $$p_i^{e_i-1}$$,
      we get $$p_i^{e_i-1}(d_0G_i) = d_0(\htmlClass{color-purple}{p_i^{e_i-1}G_i})
      = \htmlClass{color-orange}{p_i^{e_i-1}K_i}$$
      because all the other terms vanish as $$p_i^{e_i-1}(d_jp_i^{1+?}G_i) = d_j(p_i^{e_i+?}G_i) = d_jO = O$$
      due to [Lagrange's theorem](#lagrange-consequences).
      Once we have determined $$d_0$$ as the discrete logarithm of $$\htmlClass{color-orange}{p_i^{e_i-1}K_i}$$
      to the base $$\htmlClass{color-purple}{p_i^{e_i-1}G_i}$$ of order $$p_i$$ with one of the above
      [DL algorithms](#dl-algorithms), we can take $$d_0G_i$$ to the other side of the equation in red:
      <!-- --> $$d_1p_iG_i + … + d_{e_i-1}p_i^{e_i-1}G_i = K_i - \htmlClass{color-pink}{d_0}G_i$$.
      When we multiply both sides by $$p_i^{e_i-2}$$,
      we get $$p_i^{e_i-2}(d_1p_iG_i) = d_1(\htmlClass{color-purple}{p_i^{e_i-1}G_i})
      = \htmlClass{color-orange}{p_i^{e_i-2}(K_i - d_0G_i)}$$
      because all the other terms vanish again.
      After determining $$d_1$$ in the same group of order $$p_i$$ as before,
      we move $$d_1p_iG_i$$ also to the other side of the equation,
      which gives us $$d_2p_i^2G_i + … + d_{e_i-1}p_i^{e_i-1}G_i
      = K_i - d_0G_i - d_1p_iG_i = K_i - (\htmlClass{color-pink}{d_0 + d_1p_i})G_i$$.
      By continuing like this, we can determine all the digits $$d_j$$ of $$k_i$$
      without ever having to solve a discrete-logarithm problem in a group larger than $$p_i$$.
      We implement this as follows:
      </div>
   3. Compute $$H_i := \htmlClass{color-purple}{p_i^{e_i-1}G_i}$$.
      Since the order of $$G_i$$ is $$p_i^{e_i}$$, the order of $$H_i$$ is $$p_i$$.
      I colored the term $$\htmlClass{color-purple}{p_i^{e_i-1}G_i}$$ in the explanation above
      so that it's easier for you to see that each digit $$d_j$$ is determined in the group generated by $$H_i$$.
   4. For $$j$$ from $$0$$ to $$e_i - 1$$, do the following:
      1. If $$j = 0$$, set $$s_j := 0$$.
         Otherwise, set $$s_j := \htmlClass{color-pink}{s_{j-1} + d_{j-1} \cdot p_i^{j-1}}$$.
         <!-- --> $$s_j$$ is the sum of all the digits that we have found so far,
         where each digit is multiplied by the value of its [position](https://en.wikipedia.org/wiki/Positional_notation).
         I colored this partial sum in the explanation above so that it's easier for you to see where it's being used.
      2. Compute $$D_j := \htmlClass{color-orange}{p_i^{e_i-1-j}(K_i - s_jG_i)}$$.
         I also colored the occurrences of this expression in the explanation above.
      3. Find $$d_j$$ so that $$d_jH_i = D_j$$ with one of the above [DL algorithms](#dl-algorithms).
   5. Compute $$k_i := d_0 + d_1p_i + d_2p_i^2 + … + d_{e_i-1}p_i^{e_i-1} = \sum_{j=0}^{e_i-1} d_jp_i^j$$.
      (Alternatively, set $$k_i := s_{e_i-1} + d_{e_i-1}p_i^{e_i-1}$$.)
3. Use the [Chinese remainder theorem](#chinese-remainder-theorem) to solve
   the system of [congruences](#congruence-relation) $$k =_{p_i^{e_i}} k_i$$ efficiently.
4. Return $$k$$ as the solution to $$kG = K$$.

<!-- -->

1. Find the [prime factorization](#prime-factorization) of $$n$$ so that $$n = p_1^{e_1} \cdot … \cdot p_l^{e_l}$$
   for distinct primes $$p_i$$ and integers $$e_i ≥ 1$$.
   Since the Pohlig-Hellman decomposition succeeds only if all the prime factors are sufficiently small,
   [Pollard's rho factorization algorithm](#pollards-rho-factorization-algorithm) is a good choice for this step.
   If the factorization fails because some factors are too large, the steps below wouldn't work either.
2. For $$i$$ from $$1$$ to $$l$$, do the following:
   1. Compute $$G_i := G^{n/p_i^{e_i}}$$.
      Since the order of $$G$$ is $$n$$, the order of $$G_i$$ is $$p_i^{e_i}$$.
   2. Compute $$K_i := K^{n/p_i^{e_i}}$$.
      Since $$G^k = K$$, we have that $$K_i = (G^k)^{n/p_i^{e_i}} = (G^{n/p_i^{e_i}})^k = G_i^k$$,
      which means that the discrete logarithm of $$K$$ to the base $$G$$
      is also a discrete logarithm of $$K_i$$ to the base $$G_i$$.
      As we saw [earlier](#repetition-ring), a discrete logarithm is unique only up to the order of its base.
      Therefore, the discrete logarithm of $$K_i$$ to the base $$G_i$$, which I denote as $$k_i$$,
      is not necessarily a discrete logarithm of $$K$$ to the base $$G$$
      as $$k_i \in \{0, …, p_i^{e_i} - 1\}$$, whereas $$k \in \{0, …, n - 1\}$$.
      A discrete logarithm is unique up to the order of its base, though, which implies that $$k =_{p_i^{e_i}} k_i$$.
      <div class="mt-2" markdown="span">
      Instead of determining $$k$$ so that $$G^k = K$$ in the original group of order $$n$$,
      we can thus determine $$k_i$$ so that $$G_i^{k_i} = K_i$$ in the [subgroup](#subgroups)
      [generated](#group-generators) by $$G_i$$ of order $$p_i^{e_i}$$, which improves the expected running time
      from $$\sqrt{n}$$ to $$\sqrt{p_i^{e_i}}$$ when using [Pollard's rho algorithm](#pollards-rho-algorithm) for this.
      Depending on the prime factorization of $$n$$, this can already be a big improvement.
      The following insight allows us to determine $$k_i$$ in the steps 2.3 to 2.5 below
      without ever having to compute a discrete logarithm in a group larger than $$p_i$$,
      which improves the expected running time even further to $$\sqrt{p_i}$$.
      If you're not interested in this, you can continue with the step 3 at the bottom of this box.
      </div>
      <div class="mt-2" markdown="span">
      **Insight**: We can write $$k_i$$ in [base](https://en.wikipedia.org/wiki/Radix) $$p_i$$ as
      <!-- --> $$k_i = d_0 + d_1p_i + d_2p_i^2 + … + d_{e_i-1}p_i^{e_i-1} = \sum_{j=0}^{e_i-1} d_jp_i^j$$,
      where each digit $$d_j \in \{0, …, p_i - 1\}$$.
      Now, $$G_i^{k_i} = G_i^{d_0 + d_1p_i + … + d_{e_i-1}p_i^{e_i-1}}
      = \htmlClass{color-red}{G_i^{d_0} \cdot G_i^{d_1p_i} \cdot … \cdot G_i^{d_{e_i-1}p_i^{e_i-1}} = K_i}$$.
      When we raise both sides to the power of $$p_i^{e_i-1}$$,
      we get $$(G_i^{d_0})^{p_i^{e_i-1}} = (\htmlClass{color-purple}{G_i^{p_i^{e_i-1}}})^{d_0}
      = \htmlClass{color-orange}{K_i^{p_i^{e_i-1}}}$$
      because all the other factors vanish
      as $$(G_i^{d_jp_i^{1+?}})^{p_i^{e_i-1}} = (G_i^{p_i^{e_i+?}})^{d_j} = I^{d_j} = I$$
      due to [Lagrange's theorem](#lagrange-consequences).
      Once we have determined $$d_0$$ as the discrete logarithm of $$\htmlClass{color-orange}{K_i^{p_i^{e_i-1}}}$$
      to the base $$\htmlClass{color-purple}{G_i^{p_i^{e_i-1}}}$$ of order $$p_i$$ with one of the above
      [DL algorithms](#dl-algorithms), we can take $$G_i^{d_0}$$ to the other side of the equation in red:
      <!-- --> $$G_i^{d_1p_i} \cdot … \cdot G_i^{d_{e_i-1}p_i^{e_i-1}} = K_i / G_i^{\htmlClass{color-pink}{d_0}}$$.
      When we raise both sides to the power of $$p_i^{e_i-2}$$,
      we get $$(G_i^{d_1p_i})^{p_i^{e_i-2}} = (\htmlClass{color-purple}{G_i^{p_i^{e_i-1}}})^{d_1}
      = \htmlClass{color-orange}{(K_i / G_i^{d_0})^{p_i^{e_i-2}}}$$
      because all the other factors vanish again.
      After determining $$d_1$$ in the same group of order $$p_i$$ as before,
      we move $$G_i^{d_1p_i}$$ also to the other side of the equation,
      which gives us $$G_i^{d_2p_i^2} \cdot … \cdot G_i^{d_{e_i-1}p_i^{e_i-1}}
      = K_i / G_i^{d_0} / G_i^{d_1p_i} = K_i / G_i^{\htmlClass{color-pink}{d_0 + d_1p_i}}$$.
      By continuing like this, we can determine all the digits $$d_j$$ of $$k_i$$
      without ever having to solve a discrete-logarithm problem in a group larger than $$p_i$$.
      We implement this as follows:
      </div>
   3. Compute $$H_i := \htmlClass{color-purple}{G_i^{p_i^{e_i-1}}}$$.
      Since the order of $$G_i$$ is $$p_i^{e_i}$$, the order of $$H_i$$ is $$p_i$$.
      I colored the term $$\htmlClass{color-purple}{G_i^{p_i^{e_i-1}}}$$ in the explanation above
      so that it's easier for you to see that each digit $$d_j$$ is determined in the group generated by $$H_i$$.
   4. For $$j$$ from $$0$$ to $$e_i - 1$$, do the following:
      1. If $$j = 0$$, set $$s_j := 0$$.
         Otherwise, set $$s_j := \htmlClass{color-pink}{s_{j-1} + d_{j-1} \cdot p_i^{j-1}}$$.
         <!-- --> $$s_j$$ is the sum of all the digits that we have found so far,
         where each digit is multiplied by the value of its [position](https://en.wikipedia.org/wiki/Positional_notation).
         I colored this partial sum in the explanation above so that it's easier for you to see where it's being used.
      2. Compute $$D_j := \htmlClass{color-orange}{(K_i / G_i^{s_j})^{p_i^{e_i-1-j}}}$$.
         I also colored the occurrences of this expression in the explanation above.
      3. Find $$d_j$$ so that $$H_i^{d_j} = D_j$$ with one of the above [DL algorithms](#dl-algorithms).
   5. Compute $$k_i := d_0 + d_1p_i + d_2p_i^2 + … + d_{e_i-1}p_i^{e_i-1} = \sum_{j=0}^{e_i-1} d_jp_i^j$$.
      (Alternatively, set $$k_i := s_{e_i-1} + d_{e_i-1}p_i^{e_i-1}$$.)
3. Use the [Chinese remainder theorem](#chinese-remainder-theorem) to solve
   the system of [congruences](#congruence-relation) $$k =_{p_i^{e_i}} k_i$$ efficiently.
4. Return $$k$$ as the solution to $$G^k = K$$.

</div>

The above algorithm shows that the difficulty of computing discrete logarithms is determined
by the size of the largest prime factor $$p_l$$ of the group's order $$n$$, ignoring even its exponent $$e_l$$.
This means that if the [multiplicative group](#multiplicative-groups) or the [elliptic curve](#elliptic-curves)
isn't chosen carefully, it can be relatively easy to invert the linear one-way function.
For example, the tool below computes discrete logarithms modulo the 107-digit/354-bit prime
22'<wbr>708'<wbr>823'<wbr>198'<wbr>678'<wbr>103'<wbr>974'<wbr>314'<wbr>518'<wbr>195'<wbr>029'<wbr>102'<wbr>158'<wbr>525'<wbr>052'<wbr>496'<wbr>759'<wbr>285'<wbr>596'<wbr>453'<wbr>269'<wbr>189'<wbr>798'<wbr>311'<wbr>427'<wbr>475'<wbr>159'<wbr>776'<wbr>411'<wbr>276'<wbr>642'<wbr>277'<wbr>139'<wbr>650'<wbr>833'<wbr>937
[in a matter of seconds](#tool-discrete-logarithm-multiplicative-group-pohlig-hellman-algorithm&m=22%27708%27823%27198%27678%27103%27974%27314%27518%27195%27029%27102%27158%27525%27052%27496%27759%27285%27596%27453%27269%27189%27798%27311%27427%27475%27159%27776%27411%27276%27642%27277%27139%27650%27833%27937&G=14%27136%27903%27746%27155%27542%27756%27936%27318%27521%27399%27536%27141%27677%27114%27490%27014%27478%27332%27748%27609%27939%27845%27161%27528%27382%27171%27444%27487%27618%27906%27406%27429%27937%27620%27299&n=22%27708%27823%27198%27678%27103%27974%27314%27518%27195%27029%27102%27158%27525%27052%27496%27759%27285%27596%27453%27269%27189%27798%27311%27427%27475%27159%27776%27411%27276%27642%27277%27139%27650%27833%27936&K=13%27975%27782%27396%27137%27250%27709%27191%27883%27099%27679%27318%27661%27105%27537%27856%27900%27563%27390%27003%27561%27208%27048%27584%27578%27667%27386%27417%27480%27181%27203%27426%27948%27149%27158%27235)
because the largest prime factor of this prime minus one is just 350'<wbr>377.
(I took this example from the note 3.66 in the
[Handbook of Applied Cryptography](https://cacr.uwaterloo.ca/hac/about/chap3.pdf).)
On the other hand, if you choose a [safe prime](#sophie-germain-and-safe-primes) as the modulus of a multiplicative group,
the Pohlig-Hellman algorithm reduces the difficulty of the group's discrete-logarithm problem only by a single bit.
In the case of elliptic curves, it makes sense to choose the [parameters](#curve-parameters)
such that the group contains a prime number of points to begin with.

The following tool implements the Pohlig-Hellman algorithm.
Since [Pollard's rho algorithm](#pollards-rho-algorithm) has a decent chance of total failure in small groups,
the tool uses [exhaustive search](#exhaustive-search) to find the discrete logarithm in groups smaller than 100
and Pollard's rho algorithm with a randomly chosen starting element in the case of failure otherwise.
Unlike the other [DL algorithms](#dl-algorithms), you cannot configure a delay
because the only aspects worth animating are the sub-algorithms that we've already covered.
This tool simply links to the corresponding tool with the current values
so that you can inspect the steps of the sub-algorithm there.

<div class="tabbed" data-titles="Multiplicative group | Elliptic curve | Both" data-default="Multiplicative group">
    <div id="tool-discrete-logarithm-multiplicative-group-pohlig-hellman-algorithm"></div>
    <div id="tool-discrete-logarithm-elliptic-curve-pohlig-hellman-algorithm"></div>
</div>

<details markdown="block">
<summary markdown="span" id="potential-for-backdoors-in-multiplicative-groups">
Potential for backdoors in multiplicative groups
</summary>

Before you rely on a [multiplicative group](#multiplicative-groups) which was provided by someone else
to be a [linear one-way function](#linear-one-way-functions),
you have to verify that the [group's order](#group-order) has a [sufficiently large](#bits-of-security) prime factor.
If the group's order or its [prime factorization](#prime-factorization) is not known to you
(because they aren't provided to you or you can't determine them), you shouldn't use the group.
Otherwise, an attacker can choose the modulus $$m$$ as the product of two large primes $$p$$ and $$q$$,
where both $$p - 1$$ and $$q - 1$$ have only relatively small prime factors.
Since it's difficult to factorize such a modulus $$m$$,
only the attacker can determine the group's order $$\href{#eulers-totient-function}{\varphi}(m) = (p - 1) \cdot (q - 1)$$
and use the [Pohlig-Hellman algorithm](#pohlig-hellman-algorithm) to compute discrete logarithms in this group.
In order to avoid [such a backdoor](https://crypto.stackexchange.com/a/39268/76600),
you must insist that the other party shares the group's order and its prime factorization with you.

</details>


### Index-calculus algorithm

The [index-calculus algorithm](https://en.wikipedia.org/wiki/Index_calculus_algorithm)
computes discrete logarithms in [multiplicative groups](#multiplicative-groups)
much faster than [Pollard's rho algorithm](#pollards-rho-algorithm).
It exploits the circumstance that sufficiently many integers are sufficiently [smooth](#smooth-numbers),
i.e. their [prime factorization](#prime-factorization) contains no factors larger than some integer $$S$$.
Let $$P_1$$, …, $$P_l$$ denote all the prime numbers smaller than $$S$$.
An $$S$$-smooth number $$A$$ can then be written as $$A = P_1^{e_1} \cdot … \cdot P_l^{e_l}$$,
where $$e_i = 0$$ if $$P_i$$ is not a prime factor of $$A$$ for each $$i \in \{1, …, l\}$$.
If we assume for now that the modulus $$m$$ is prime and greater than $$S$$,
and that $$G$$ generates the whole group [$$\mathbb{Z}_m^\times$$](#multiplicative-group-notations),
there exists an integer $$p_i$$ for each $$P_i$$ so that $$G^{p_i} =_m P_i$$.
To determine these integers, we repeatedly choose a random integer $$r \in \{1, … n\}$$,
where $$n = \href{#element-order}{\lvert G \rvert}$$, until $$G^r =_m R$$ is $$S$$-smooth:

$$
G^r =_m R
= P_1^{e_1} \cdot … \cdot P_l^{e_l}
=_m (G^{p_1})^{e_1} \cdot … \cdot (G^{p_1})^{e_l}
= G^{e_1 \cdot p_1 + … + e_l \cdot p_l}
$$

After taking the [logarithm](https://en.wikipedia.org/wiki/Logarithm)
to [base](https://en.wikipedia.org/wiki/Base_(exponentiation)) $$G$$ on both ends,
we get $$r =_n e_1 \cdot p_1 + … + e_l \cdot p_l$$ in the [repetition ring](#repetition-ring) of $$G$$.
If we find enough such equations,
we can solve the following [system of linear equations](https://en.wikipedia.org/wiki/System_of_linear_equations)
using [Gaussian elimination](https://en.wikipedia.org/wiki/Gaussian_elimination),
named after [Carl Friedrich Gauss](https://en.wikipedia.org/wiki/Carl_Friedrich_Gauss) (1777 − 1855).
(I'll explain [matrix multiplication](https://en.wikipedia.org/wiki/Matrix_multiplication)
and Gaussian elimination in the article about coding theory.)

{:.aligned}
$$
\begin{aligned}
e_{1,1} \cdot p_1 + … + e_{1,l} \cdot p_l &=_n r_1 \\
\vdots \quad &=_n \, \vdots \\
e_{l,1} \cdot p_1 + … + e_{l,l} \cdot p_l &=_n r_l
\end{aligned}
\quad \iff \quad
\begin{bmatrix}
e_{1,1} & \cdots & e_{1,l} \\
\vdots & & \vdots \\
e_{l,1} & \cdots & e_{l,l} \\
\end{bmatrix}
\cdot
\begin{bmatrix}
p_1 \\
\vdots \\
p_l \\
\end{bmatrix}
=_n
\begin{bmatrix}
r_1 \\
\vdots \\
r_l \\
\end{bmatrix}
$$

Since not all rows are [linearly independent](https://en.wikipedia.org/wiki/Linear_independence) from one another
and not all elements are invertible in the [ring](#commutative-rings) of [integers modulo $$n$$](#integers-modulo-m),
we usually need more than just $$l$$ equations to solve for the integers $$p_1$$ to $$p_l$$.
Once we have found these values,
we increment a counter $$c$$ starting from $$0$$ until $$K \cdot G^c =_m T$$ is $$S$$-smooth.
[Remember](#dl-algorithms): We want to find an integer $$k$$ so that $$G^k =_m K$$.
Given $$K \cdot G^c =_m T = P_1^{e_1} \cdot … \cdot P_l^{e_l} =_m (G^{p_1})^{e_1} \cdot … \cdot (G^{p_1})^{e_l}
= G^{e_1 \cdot p_1 + … + e_l \cdot p_l}$$ for some new exponents $$e_1$$ to $$e_l$$,
we can determine $$k$$ as follows:

{:.aligned}
$$
\begin{aligned}
k + c &=_n e_1 \cdot p_1 + … + e_l \cdot p_l \\
k &=_n e_1 \cdot p_1 + … + e_l \cdot p_l - c
\end{aligned}
$$

If you want to compute several discrete logarithms in the same group,
you have to determine the integers $$p_1$$ to $$p_l$$ only once,
which makes the index-calculus algorithm even faster.
(The discrete logarithm of $$P_i$$ with respect to $$G$$ is also called the index of $$P_i$$ with respect to $$G$$,
hence the name index [calculus](https://en.wikipedia.org/wiki/Calculus_(disambiguation)).)
The algorithm doesn't work for [elliptic curves](#elliptic-curves)
because points cannot be [factorized](#prime-factorization).
The [running time](https://en.wikipedia.org/wiki/Time_complexity)
[of the index-calculus algorithm](https://en.wikipedia.org/wiki/Index_calculus_algorithm#Complexity)
is $$\mathrm{e}^{(\sqrt{2} + \href{https://en.wikipedia.org/wiki/Big_O_notation#Family_of_Bachmann%E2%80%93Landau_notations}{o}(1))\sqrt{\log_\mathrm{e}(m) \cdot \log_\mathrm{e}(\log_\mathrm{e}(m))}}$$,
which is [subexponential](https://en.wikipedia.org/wiki/Time_complexity#Sub-exponential_time)
and [superpolynomial](https://en.wikipedia.org/wiki/Time_complexity#Superpolynomial_time).

The following tool implements the index-calculus algorithm.
In order to make its output [reproducible](https://en.wikipedia.org/wiki/Reproducibility),
the tool increments $$r$$ starting from $$1$$ in its search for smooth group elements instead of choosing $$r$$ randomly.
It continues the search until the matrix of exponents becomes
[invertible](https://en.wikipedia.org/wiki/Invertible_matrix) modulo $$n$$.
As long as you [disable the delay](#tool-discrete-logarithm-multiplicative-group-index-calculus-algorithm&d=0),
it handles 50-bit moduli just fine.
For example, it takes only around 7'800'000 steps
to compute discrete logarithms modulo the [safe prime](#sophie-germain-and-safe-primes)
[627'789'652'071'083](#tool-discrete-logarithm-multiplicative-group-index-calculus-algorithm&m=627%27789%27652%27071%27083&G=482%27296%27703%27860%27973&n=627%27789%27652%27071%27082&k=274%27527%27666%27048%27997&K=571%27301%27098%27261%27669&d=0).
In order to share its inputs with the [DL algorithms](#dl-algorithms) above,
the tool doesn't allow you to configure the number of prime bases yourself.
It chooses $$l = \operatorname{min}(\log_\mathrm{e}(n), 50)$$.

<div class="tabbed" data-titles="Multiplicative group" data-default="Multiplicative group">
    <div id="tool-discrete-logarithm-multiplicative-group-index-calculus-algorithm"></div>
</div>

<details markdown="block">
<summary markdown="span" id="index-calculus-in-subgroups">
Index calculus in subgroups
</summary>

What if $$G$$ [generates](#group-generators) only a proper [subgroup](#subgroups)
of [$$\mathbb{Z}_m^\times$$](#multiplicative-group-notations)?
Since the [running time](https://en.wikipedia.org/wiki/Time_complexity)
of the [index-calculus algorithm](#index-calculus-algorithm) depends on the modulus $$m$$
rather than $$G$$'s [order](#element-order) $$n$$,
[Pollard's rho algorithm](#pollards-rho-algorithm) is faster than the index-calculus algorithm when $$n$$ is small enough.
If $$n$$ has many small factors, the [Pohlig-Hellman algorithm](#pohlig-hellman-algorithm) is even faster, of course.
(Since the index-calculus algorithm is not the best choice for relatively small subgroups,
it usually doesn't make sense to use it as the [DL algorithm](#dl-algorithms) in the Pohlig-Hellman algorithm.)
If $$n$$ is neither small nor smooth,
you can solve the [discrete-logarithm problem](#discrete-logarithm-problem) $$G^k =_m K$$ as follows
according to section 3.6.6 of the [Handbook of Applied Cryptography](https://cacr.uwaterloo.ca/hac/about/chap3.pdf)
(I don't divide $$h$$ and $$g$$ by the [cofactor of the subgroup](#index-and-cofactor) for simplicity):
1. Find an element $$H \in \mathbb{Z}_m^\times$$,
   which [generates the whole group](#a-faster-algorithm-for-finding-a-generator).
   (We still assume that $$m$$ is prime, and thus $$\lvert \mathbb{Z}_m^\times \rvert = m - 1$$.)
2. Use the index-calculus algorithm to find an integer $$g$$ so that $$H^g =_m G$$.
3. Use the index-calculus algorithm to find an integer $$h$$ so that $$H^h =_m K$$.
4. Return $$k :=_n h \cdot g^{-1}$$.

This works because $$(H^g)^k =_m H^h$$ implies that $$g \cdot k =_{m-1} h$$.
Since $$n$$ divides $$m - 1$$, we have that $$g \cdot k - h$$ is also a multiple of $$n$$, and thus $$g \cdot k =_n h$$.
Since $$k$$ is unique up to a multiple of $$n$$, $$g$$ has to be invertible modulo $$n$$.
Therefore, $$k =_n h \cdot g^{-1}$$.

Interestingly, the above tool succeeds even if one of the bases $$P_i$$ is not in the subgroup generated by $$G$$.
For example, it solves discrete logarithms in the subgroup of order 32 modulo 96
[just fine](#tool-discrete-logarithm-multiplicative-group-index-calculus-algorithm&m=97&G=20&n=32&K=27).
I have no idea why the index-calculus algorithm still works in this case,
and I haven't found any information about this phenomenon.
If you know the answer, please [let me know](mailto:contact@ef1p.com).

</details>

<details markdown="block">
<summary markdown="span" id="index-calculus-with-composite-moduli">
Index calculus with composite moduli
</summary>

If the modulus $$m$$ is composite,
the [above tool](#tool-discrete-logarithm-multiplicative-group-index-calculus-algorithm)
fails to invert the matrix of exponents.
I understand that the prime factors of $$G$$'s [order](#element-order) $$n$$ determine
which exponents have a [multiplicative inverse](#multiplicative-inverse-revisited) modulo $$n$$,
which is why the above tool displays the [prime factorization](#prime-factorization) of $$n$$.
However, $$n$$ can have many small factors no matter whether $$m$$ is composite or prime.
If you find a composite modulus for which the tool succeeds for a subgroup larger than four,
or if you know why this isn't possible, please [let me know](mailto:contact@ef1p.com).

</details>


### Bits of security

As we learned in this chapter, it takes only around [$$\sqrt{n}$$ steps](#birthday-paradox)
to compute discrete logarithms in [groups](#finite-groups) of prime [order](#group-order) $$n$$
due to [Pollard's rho algorithm](#pollards-rho-algorithm).
If the order $$n$$ is composite, the [Pohlig-Hellman algorithm](#pohlig-hellman-algorithm)
reduces the difficulty of computing discrete logarithms to the square root of the largest prime factor of $$n$$.
In the case of [multiplicative groups](#multiplicative-groups),
it takes even fewer steps due to the [index-calculus algorithm](#index-calculus-algorithm).
The [bit-length](https://en.wikipedia.org/wiki/Bit-length) of the expected number of steps required
to break a [cryptographic primitive](https://en.wikipedia.org/wiki/Cryptographic_primitive)
defines its [security level](https://en.wikipedia.org/wiki/Security_level).
When we say that a primitive has $$s$$ bits of security, it takes on average around $$2^s$$ steps to break it.
Given the current state of computers, cryptographic primitives become
[computationally intractable](https://en.wikipedia.org/wiki/Computational_complexity_theory#Intractability)
at [around 100 bits of security](https://en.wikipedia.org/wiki/Discrete_logarithm_records).
In order to ensure that our [linear one-way functions](#linear-one-way-functions)
are indeed [one-way functions](https://en.wikipedia.org/wiki/One-way_function),
we have to choose sufficiently large parameters as follows:

<figure markdown="block">

<table class="text-right">
  <thead>
    <tr>
      <th>Bits of security</th>
      <th><a href="#elliptic-curves">Elliptic curves</a>:<br>length of G's order n in bits</th>
      <th><a href="#multiplicative-groups">Multiplicative groups</a>:<br>length of modulus m in bits</th>
    </tr>
  </thead>
  <tbody>
    <tr class="background-color-red">
      <td>80</td>
      <td>160</td>
      <td>1'024</td>
    </tr>
    <tr class="background-color-orange">
      <td>112</td>
      <td>224</td>
      <td>2'048</td>
    </tr>
    <tr class="background-color-green">
      <td>128</td>
      <td>256</td>
      <td>3'072</td>
    </tr>
    <tr class="background-color-green">
      <td>192</td>
      <td>384</td>
      <td>7'680</td>
    </tr>
    <tr class="background-color-green">
      <td>256</td>
      <td>512</td>
      <td>15'360</td>
    </tr>
  </tbody>
</table>

<figcaption markdown="span" style="max-width: 525px;">
Comparable security strengths as listed in section 5.6.1.1 starting on page 53
in [this recommendation](https://doi.org/10.6028/NIST.SP.800-57pt1r5)
by the [National Institute of Standards and Technology (NIST)](https://en.wikipedia.org/wiki/National_Institute_of_Standards_and_Technology).
The security level with the red background can no longer be considered secure.
</figcaption>
</figure>

As explained [earlier](#index-calculus-in-subgroups),
just the modulus of multiplicative groups have to be this large.
The subgroup generated by $$G$$ can be as "small" as an elliptic curve group of the same security level.
As we will see in the next article about [cryptosystems](https://en.wikipedia.org/wiki/Cryptosystem),
the input $$k$$ to the linear one-way function is usually a [private key](/internet/#digital-signatures),
while the output $$K$$ is the corresponding [public key](https://en.wikipedia.org/wiki/Public-key_cryptography).
The advantages of elliptic curves over multiplicative groups are that their public keys are smaller
and that their group operations are faster since the numbers are smaller.


## Group properties (appendix) {#group-properties}
{:data-toc-text="Group properties"}


### Reduced group axioms

Using [universal and existential quantifiers](#universal-and-existential-quantifiers)
to make statements about the elements of a set, the [group axioms](#group-axioms) can be reduced to:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

- **Closure (G1)**: $$\forall\ A, B \in \mathbb{G}\ A \circ B \in \mathbb{G}$$
- **Associativity (G2)**: $$\forall\ A, B, C \in \mathbb{G}\ (A \circ B) \circ C = A \circ (B \circ C)$$
- **Identity (G3)**: $$\exists\ E \in \mathbb{G}\ \forall\ A \in \mathbb{G}\ A \circ E = A$$
- **Invertibility (G4)**: $$\forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}\ A \circ B = E$$

<!-- -->

- **Closure (G1)**: $$\forall\ A, B \in \mathbb{G}\ A + B \in \mathbb{G}$$
- **Associativity (G2)**: $$\forall\ A, B, C \in \mathbb{G}\ (A + B) + C = A + (B + C)$$
- **Identity (G3)**: $$\exists\ O \in \mathbb{G}\ \forall\ A \in \mathbb{G}\ A + O = A$$
- **Invertibility (G4)**: $$\forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}\ A + B = O$$

<!-- -->

- **Closure (G1)**: $$\forall\ A, B \in \mathbb{G}\ A \cdot B \in \mathbb{G}$$
- **Associativity (G2)**: $$\forall\ A, B, C \in \mathbb{G}\ (A \cdot B) \cdot C = A \cdot (B \cdot C)$$
- **Identity (G3)**: $$\exists\ I \in \mathbb{G}\ \forall\ A \in \mathbb{G}\ A \cdot I = A$$
- **Invertibility (G4)**: $$\forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}\ A \cdot B = I$$

</div>

[Commutative groups](#commutative-groups) have an additional axiom:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

**Commutativity (G5)**: $$\forall\ A, B \in \mathbb{G}\ A \circ B = B \circ A$$

**Commutativity (G5)**: $$\forall\ A, B \in \mathbb{G}\ A + B = B + A$$

**Commutativity (G5)**: $$\forall\ A, B \in \mathbb{G}\ A \cdot B = B \cdot A$$

</div>

<details markdown="block">
<summary markdown="span" id="less-ambiguous-notation">
Less ambiguous notation
</summary>

Since the third axiom (G3) does not specify how many identity elements there are,
this notation is still a bit sloppy as it leaves the meaning of the identity element in the last axiom (G4) open.
Must each element have an inverse for some identity element or for all identity elements?
Keeping the [quantifiers](#universal-and-existential-quantifiers) at the beginning of the statement
and using the [logical conjunction $$\land$$](#logical-conjunction) ("and"),
the group axioms can be written less ambiguously as:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\exists\ E \in \mathbb{G}\ \forall\ A, B, C \in \mathbb{G}\ \exists\ D \in \mathbb{G}
\ A \circ B \in \mathbb{G} \land
(A \circ B) \circ C = A \circ (B \circ C) \land
A \circ E = A \land
A \circ D = E
$$

$$
\exists\ E \in \mathbb{G}\ \forall\ A, B, C \in \mathbb{G}\ \exists\ D \in \mathbb{G}
\ A + B \in \mathbb{G} \land
(A + B) + C = A + (B + C) \land
A + O = A \land
A + D = O
$$

$$
\exists\ E \in \mathbb{G}\ \forall\ A, B, C \in \mathbb{G}\ \exists\ D \in \mathbb{G}
A \cdot B \in \mathbb{G} \land
(A \cdot B) \cdot C = A \cdot (B \cdot C) \land
A \cdot I = A \land
A \cdot D = I
$$

</div>

If, on the other hand, we replace the invertibility axiom with the following,
then we [do not define a group](https://math.stackexchange.com/questions/127646/minimal-axioms-for-a-group):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

**Fake invertibility**:
$$\forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}\ \forall\ C \in \mathbb{G}\ C \circ (A \circ B) = C$$

**Fake invertibility**:
$$\forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}\ \forall\ C \in \mathbb{G}\ C + (A + B) = C$$

**Fake invertibility**:
$$\forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}\ \forall\ C \in \mathbb{G}\ C \cdot (A \cdot B) = C$$

</div>

For example, the binary operation could then be defined as $$X \circ Y = X$$
so that every element is a right identity and every element is a right inverse for every element,
which is clearly not the same (and therefore not a group).
We will see soon that there can be only [one identity element](#uniqueness-of-right-identity)
and that each element has a [unique inverse](#uniqueness-of-inverses),
which is why this aspect is [often ignored](https://math.stackexchange.com/questions/65239/right-identity-and-right-inverse-implies-a-group#comment154089_65239).

</details>

<details markdown="block">
<summary markdown="span" id="group-like-algebraic-structures">
Group-like algebraic structures
</summary>

If you remove one or several axioms from the above definition,
you get [other algebraic structures](https://en.wikipedia.org/wiki/Group_(mathematics)#Generalizations),
most of which have names:

<figure markdown="block" class="allow-break-inside">

| Structure | Closure | Associativity | Identity | Invertibility
|-|:-:|:-:|:-:|:-:
| [Semigroupoid](https://en.wikipedia.org/wiki/Semigroupoid) | <i class="fas fa-times color-red"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-times color-red"></i>
| [Small category](https://en.wikipedia.org/wiki/Category_(mathematics)) | <i class="fas fa-times color-red"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i>
| [Groupoid](https://en.wikipedia.org/wiki/Groupoid) | <i class="fas fa-times color-red"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i>
| [Magma](https://en.wikipedia.org/wiki/Magma_(algebra)) | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-times color-red"></i>
| [Quasigroup](https://en.wikipedia.org/wiki/Quasigroup) | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-check color-green"></i>
| [Unital magma](https://en.wikipedia.org/wiki/Unital_magma) | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i>
| [Semigroup](https://en.wikipedia.org/wiki/Semigroup) | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-times color-red"></i>
| [Loop](https://en.wikipedia.org/wiki/Loop_(algebra)) | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i>
| [Inverse semigroup](https://en.wikipedia.org/wiki/Inverse_semigroup) | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i> | <i class="fas fa-check color-green"></i>
| [Monoid](https://en.wikipedia.org/wiki/Monoid) | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-times color-red"></i>
| [Group](https://en.wikipedia.org/wiki/Group_(mathematics)) | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i> | <i class="fas fa-check color-green"></i>

<figcaption markdown="span">
The axioms of various group-like algebraic structures.
</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="alternative-group-axioms">
Alternative group axioms
</summary>

Instead of requiring that there is an identity and that each element has an inverse,
we can simply require the [following axiom](https://planetmath.org/alternativedefinitionofgroup):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

**Solvability**: $$\forall\ A, B \in \mathbb{G}\ \exists\ X, Y \in \mathbb{G}\ X \circ A = A \circ Y = B$$

**Solvability**: $$\forall\ A, B \in \mathbb{G}\ \exists\ X, Y \in \mathbb{G}\ X + A = A + Y = B$$

**Solvability**: $$\forall\ A, B \in \mathbb{G}\ \exists\ X, Y \in \mathbb{G}\ X \cdot A = A \cdot Y = B$$

</div>

This means that any element can be reached from any other element both from the left and from the right.
This implies that every element can be reached from itself, i.e. every element has an identity element.
In order to prove that this axiom, together with closure and associativity,
defines the same algebraic structure as [above](#reduced-group-axioms),
we just need show that the identity element is the same for all elements:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

<div markdown="block">
For arbitrary elements $$A$$ and $$B$$, there exist
- $$E_A$$ and $$E_B$$ so that $$E_A \circ A = A$$ and $$B \circ E_B = B$$,
- and $$X$$ and $$Y$$ so that $$X \circ B = E_A$$ and $$A \circ Y = E_B$$.

Thus, $$E_A = X \circ B = X \circ (B \circ E_B) = (X \circ B) \circ E_B = E_A \circ E_B = E_A \circ (A \circ Y) = (E_A \circ A) \circ Y = A \circ Y = E_B$$.
</div>

<div markdown="block">
For arbitrary elements $$A$$ and $$B$$, there exist
- $$O_A$$ and $$O_B$$ so that $$O_A + A = A$$ and $$B + O_B = B$$,
- and $$X$$ and $$Y$$ so that $$X + B = O_A$$ and $$A + Y = O_B$$.

Thus, $$O_A = X + B = X + (B + O_B) = (X + B) + O_B = O_A + O_B = O_A + (A + Y) = (O_A + A) + Y = A + Y = O_B$$.
</div>

<div markdown="block">
For arbitrary elements $$A$$ and $$B$$, there exist
- $$I_A$$ and $$I_B$$ so that $$I_A \cdot A = A$$ and $$B \cdot I_B = B$$,
- and $$X$$ and $$Y$$ so that $$X \cdot B = I_A$$ and $$A \cdot Y = I_B$$.

Thus, $$I_A = X \cdot B = X \cdot (B \cdot I_B) = (X \cdot B) \cdot I_B = I_A \cdot I_B = I_A \cdot (A \cdot Y) = (I_A \cdot A) \cdot Y = A \cdot Y = I_B$$.
</div>

</div>

As every equation with two known values and one unknown value has a solution (see the axiom),
every element has an inverse.

</details>


### Properties of equality

Before we can derive properties from the above group axioms, we need to discuss
the [four basic properties of equality](https://en.wikipedia.org/wiki/Equality_(mathematics)#Basic_properties):

- [**Reflexivity (E1)**](https://en.wikipedia.org/wiki/Reflexive_relation):
  $$\forall\ A \in \mathbb{G}\ A = A$$
- [**Symmetry (E2)**](https://en.wikipedia.org/wiki/Symmetric_relation):
  $$\forall\ A, B \in \mathbb{G}\ A = B \implies B = A$$
- [**Transitivity (E3)**](https://en.wikipedia.org/wiki/Transitive_relation):
  $$\forall\ A, B, C \in \mathbb{G}\ A = B \land B = C \implies A = C$$
- [**Substitution (E4)**](https://en.wikipedia.org/wiki/Substitution_(algebra)):
  $$\forall\ F: \mathbb{G} \to \mathbb{G}\ \forall\ A, B \in \mathbb{G}\ A = B \implies F(A) = F(B)$$

These properties will be used a lot in the proofs below.
Because they are so elementary, I won't point out when I use them.

<details markdown="block">
<summary markdown="span" id="logical-conjunction">
Logical conjunction $$\land$$
</summary>

The [logical conjunction $$\land$$](https://en.wikipedia.org/wiki/Logical_conjunction) ("and") is true
[if and only if](#if-and-only-if) both operands are true ($$\htmlClass{color-green}{\top}$$)
instead of false ($$\htmlClass{color-red}{\bot}$$):

<figure markdown="block">

| $$P$$ | $$Q$$ | $$P \land Q$$
|:-:|:-:|:-:
| $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$
| $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-red}{\bot}$$
| $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-red}{\bot}$$ | $$\htmlClass{color-red}{\bot}$$
| $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$ | $$\htmlClass{color-green}{\top}$$
{:.table-with-vertical-border-after-column-2}

<figcaption markdown="span">
The definition of $$\land$$.
</figcaption>
</figure>

If you struggle to remember which of $$\land$$ and $$\lor$$ is which,
it may help to know that the logical conjunction $$\land$$ corresponds
to the [intersection $$\cap$$](https://en.wikipedia.org/wiki/Intersection_(set_theory))
of the two ["events"](https://en.wikipedia.org/wiki/Event_(probability_theory)) $$P$$ and $$Q$$,
and that the [logical disjunction $$\lor$$](#logical-disjunction) corresponds
to their [union $$\cup$$](https://en.wikipedia.org/wiki/Union_(set_theory)).

</details>


### Derived group properties


#### Preservation of equality (G6) {#preservation-of-equality}

It follows directly from the [substitution property](#properties-of-equality)
that equality is preserved when we apply the same element on both sides:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\forall\ A, B, C \in \mathbb{G}\ A = B \implies A \circ C = B \circ C \\[4pt]
\textsf{using \href{#properties-of-equality}{substitution (E4)} with } F(X) = X \circ C
$$

$$
\forall\ A, B, C \in \mathbb{G}\ A = B \implies A + C = B + C \\[4pt]
\textsf{using \href{#properties-of-equality}{substitution (E4)} with } F(X) = X + C
$$

$$
\forall\ A, B, C \in \mathbb{G}\ A = B \implies A \cdot C = B \cdot C \\[4pt]
\textsf{using \href{#properties-of-equality}{substitution (E4)} with } F(X) = X \cdot C
$$

</div>


#### Generalized associative law (G7) {#generalized-associative-law}

We prove [by induction](https://en.wikipedia.org/wiki/Mathematical_induction)
that every possible [parenthesization](https://en.wiktionary.org/wiki/parenthesization)
of $$n > 3$$ elements [is equivalent](https://groupprops.subwiki.org/wiki/Associative_implies_generalized_associative)
($$n = 3$$ is covered by the axiom [G2](#group-axioms)):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

Every parenthesization of $$A_1 \circ A_2 \circ A_3 \circ … \circ A_n$$ is equal to
the left-associated expression $$(((A_1 \circ A_2) \circ A_3) \circ …) \circ A_n$$
because any such expression can be written as $$B \circ C$$,
where $$B = A_1 \circ … \circ A_m$$, $$C = A_{m + 1} \circ … \circ A_n$$,
and $$m$$ is the position of the outermost operation.
Both $$B$$ and $$C$$ are parenthesized in an unknown way,
but since they both contain fewer elements than $$n$$,
we know by induction that they have left-associated equivalents $$B'$$ and $$C'$$.
If $$m = n - 1$$, $$B' \circ C$$ is a left-associated expression and we are done.
Otherwise, $$C'$$ can be written as $$D \circ A_n$$.
Now, $$B' \circ (D \circ A_n) = (B' \circ D) \circ A_n$$ because of [associativity (G2)](#group-axioms).
Since $$B' \circ D$$ contains less than $$n$$ elements,
it has a left-associated equivalent, which makes the expression left-associated.
(We know that $$B'$$ and $$D$$ can be represented by elements of the set because of [closure (G1)](#group-axioms).)

Every parenthesization of $$A_1 + A_2 + A_3 + … + A_n$$ is equal to
the left-associated expression $$(((A_1 + A_2) + A_3) + …) + A_n$$
because any such expression can be written as $$B + C$$,
where $$B = A_1 + … + A_m$$, $$C = A_{m + 1} + … + A_n$$,
and $$m$$ is the position of the outermost operation.
Both $$B$$ and $$C$$ are parenthesized in an unknown way,
but since they both contain fewer elements than $$n$$,
we know by induction that they have left-associated equivalents $$B'$$ and $$C'$$.
If $$m = n - 1$$, $$B' + C$$ is a left-associated expression and we are done.
Otherwise, $$C'$$ can be written as $$D + A_n$$.
Now, $$B' + (D + A_n) = (B' + D) + A_n$$ because of [associativity (G2)](#group-axioms).
Since $$B' + D$$ contains less than $$n$$ elements,
it has a left-associated equivalent, which makes the expression left-associated.
(We know that $$B'$$ and $$D$$ can be represented by elements of the set because of [closure (G1)](#group-axioms).)

Every parenthesization of $$A_1 \cdot A_2 \cdot A_3 \cdot … \cdot A_n$$ is equal to
the left-associated expression $$(((A_1 \cdot A_2) \cdot A_3) \cdot …) \cdot A_n$$
because any such expression can be written as $$B \cdot C$$,
where $$B = A_1 \cdot … \cdot A_m$$, $$C = A_{m + 1} \cdot … \cdot A_n$$,
and $$m$$ is the position of the outermost operation.
Both $$B$$ and $$C$$ are parenthesized in an unknown way,
but since they both contain fewer elements than $$n$$,
we know by induction that they have left-associated equivalents $$B'$$ and $$C'$$.
If $$m = n - 1$$, $$B' \cdot C$$ is a left-associated expression and we are done.
Otherwise, $$C'$$ can be written as $$D \cdot A_n$$.
Now, $$B' \cdot (D \cdot A_n) = (B' \cdot D) \cdot A_n$$ because of [associativity (G2)](#group-axioms).
Since $$B' \cdot D$$ contains less than $$n$$ elements,
it has a left-associated equivalent, which makes the expression left-associated.
(We know that $$B'$$ and $$D$$ can be represented by elements of the set because of [closure (G1)](#group-axioms).)

</div>


#### Uniqueness of right identity (G8) {#uniqueness-of-right-identity}

<details markdown="block" open>
<summary markdown="span" id="idempotence">
Idempotence
</summary>

We say that an element is [idempotent](https://en.wikipedia.org/wiki/Idempotence)
if it equals itself when it is combined with itself:

<div class="tabbed keep-margin" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic" markdown="block">

**Idempotence (IP)**: $$A \circ A = A$$

**Idempotence (IP)**: $$A + A = A$$

**Idempotence (IP)**: $$A \cdot A = A$$

</div>

</details>

All idempotent elements of a [group](#reduced-group-axioms)
are [equal to the same identity element](https://math.stackexchange.com/a/174035/947937):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\exists\ E \in \mathbb{G}\ \forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}
\ A \circ E \stackrel{\text{\href{#group-axioms}{G3}}}{=} A
\land A \circ B \stackrel{\text{\href{#group-axioms}{G4}}}{=} E
\land \\[4pt]
\big(A \circ A \stackrel{\text{\href{#idempotence}{IP}}}{=} A \implies
A \stackrel{\text{\href{#group-axioms}{G3}}}{=} A \circ E
\stackrel{\text{\href{#group-axioms}{G4}}}{=} A \circ (A \circ B)
\stackrel{\text{\href{#group-axioms}{G2}}}{=} (A \circ A) \circ B
\stackrel{\text{\href{#idempotence}{IP}}}{=} A \circ B
\stackrel{\text{\href{#group-axioms}{G4}}}{=} E\big)
$$

$$
\exists\ O \in \mathbb{G}\ \forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}
\ A + O \stackrel{\text{\href{#group-axioms}{G3}}}{=} A
\land A + B \stackrel{\text{\href{#group-axioms}{G4}}}{=} O
\land \\[4pt]
\big(A + A \stackrel{\text{\href{#idempotence}{IP}}}{=} A \implies
A \stackrel{\text{\href{#group-axioms}{G3}}}{=} A + O
\stackrel{\text{\href{#group-axioms}{G4}}}{=} A + (A + B)
\stackrel{\text{\href{#group-axioms}{G2}}}{=} (A + A) + B
\stackrel{\text{\href{#idempotence}{IP}}}{=} A + B
\stackrel{\text{\href{#group-axioms}{G4}}}{=} O\big)
$$

$$
\exists\ I \in \mathbb{G}\ \forall\ A \in \mathbb{G}\ \exists\ B \in \mathbb{G}
\ A \cdot I \stackrel{\text{\href{#group-axioms}{G3}}}{=} A
\land A \cdot B \stackrel{\text{\href{#group-axioms}{G4}}}{=} I
\land \\[4pt]
\big(A \cdot A \stackrel{\text{\href{#idempotence}{IP}}}{=} A \implies
A \stackrel{\text{\href{#group-axioms}{G3}}}{=} A \cdot I
\stackrel{\text{\href{#group-axioms}{G4}}}{=} A \cdot (A \cdot B)
\stackrel{\text{\href{#group-axioms}{G2}}}{=} (A \cdot A) \cdot B
\stackrel{\text{\href{#idempotence}{IP}}}{=} A \cdot B
\stackrel{\text{\href{#group-axioms}{G4}}}{=} I\big)
$$

</div>

Since an identity element is an identity for all elements, including itself, it is idempotent.
Thus, all identity elements are the same.
As a consequence, we no longer need to [quantify](#universal-and-existential-quantifiers) the identity element.
Depending on the [notation](#notation), $$E$$, $$O$$, or $$I$$ simply refers to the unique identity element from now on.
The identity element can also be seen as the output of a [nullary function](https://en.wikipedia.org/wiki/Arity#Nullary).

<details markdown="block">
<summary markdown="span" id="unique-identity-in-commutative-groups">
Unique identity in commutative groups
</summary>

If the operation is [commutative](#commutative-groups), it's much easier to see why any two identities are the same:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
E_1 \stackrel{\text{\href{#group-axioms}{G3}}}{=} E_1 \circ E_2
\stackrel{\text{\href{#commutative-groups}{G5}}}{=} E_2 \circ E_1
\stackrel{\text{\href{#group-axioms}{G3}}}{=} E_2
$$

$$
O_1 \stackrel{\text{\href{#group-axioms}{G3}}}{=} O_1 + O_2
\stackrel{\text{\href{#commutative-groups}{G5}}}{=} O_2 + O_1
\stackrel{\text{\href{#group-axioms}{G3}}}{=} O_2
$$

$$
I_1 \stackrel{\text{\href{#group-axioms}{G3}}}{=} I_1 \cdot I_2
\stackrel{\text{\href{#commutative-groups}{G5}}}{=} I_2 \cdot I_1
\stackrel{\text{\href{#group-axioms}{G3}}}{=} I_2
$$

</div>

</details>


#### Right inverses are left inverses (G9) {#right-inverses-are-left-inverses}

We show that when we apply any right inverse from the left,
the resulting element is [idempotent](#idempotence)
and thus equal to the [only identity](#uniqueness-of-right-identity):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\forall\ A, B \in \mathbb{G}\ A \circ B \stackrel{\text{\href{#group-axioms}{G4}}}{=} E \\[2pt]
\Downarrow \\[2pt]
(B \circ A) \circ (B \circ A)
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (B \circ (A \circ B)) \circ A
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B \circ E) \circ A
\stackrel{\text{\href{#group-axioms}{G3}}}{=} B \circ A
\stackrel{\text{\href{#uniqueness-of-right-identity}{G8}}}{=} E
$$

$$
\forall\ A, B \in \mathbb{G}\ A + B \stackrel{\text{\href{#group-axioms}{G4}}}{=} O \\[2pt]
\Downarrow \\[2pt]
(B + A) + (B + A)
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (B + (A + B)) + A
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B + O) + A
\stackrel{\text{\href{#group-axioms}{G3}}}{=} B + A
\stackrel{\text{\href{#uniqueness-of-right-identity}{G8}}}{=} O
$$

$$
\forall\ A, B \in \mathbb{G}\ A \cdot B \stackrel{\text{\href{#group-axioms}{G4}}}{=} I \\[2pt]
\Downarrow \\[2pt]
(B \cdot A) \cdot (B \cdot A)
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (B \cdot (A \cdot B)) \cdot A
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B \cdot I) \cdot A
\stackrel{\text{\href{#group-axioms}{G3}}}{=} B \cdot A
\stackrel{\text{\href{#uniqueness-of-right-identity}{G8}}}{=} I
$$

</div>

<details markdown="block">
<summary markdown="span" id="alternative-proof">
Alternative proof
</summary>

We can also prove that a right inverse is also a left inverse
[as follows](https://math.stackexchange.com/questions/3374804/alternative-axioms-for-groups):

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\forall\ A, B, C \in \mathbb{G}
\ A \circ B \stackrel{\text{\href{#group-axioms}{G4}}}{=} E
\land \ B \circ C \stackrel{\text{\href{#group-axioms}{G4}}}{=} E \\[2pt]
\Downarrow \\[2pt]
B \circ A
\stackrel{\text{\href{#group-axioms}{G3}}}{=} (B \circ A) \circ E
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B \circ A) \circ (B \circ C)
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (B \circ (A \circ B)) \circ C
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B \circ E) \circ C
\stackrel{\text{\href{#group-axioms}{G3}}}{=} B \circ C
\stackrel{\text{\href{#group-axioms}{G4}}}{=} E
$$

$$
\forall\ A, B, C \in \mathbb{G}
\ A + B \stackrel{\text{\href{#group-axioms}{G4}}}{=} O
\land \ B + C \stackrel{\text{\href{#group-axioms}{G4}}}{=} O \\[2pt]
\Downarrow \\[2pt]
B + A
\stackrel{\text{\href{#group-axioms}{G3}}}{=} (B + A) + O
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B + A) + (B + C)
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (B + (A + B)) + C
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B + O) + C
\stackrel{\text{\href{#group-axioms}{G3}}}{=} B + C
\stackrel{\text{\href{#group-axioms}{G4}}}{=} O
$$

$$
\forall\ A, B, C \in \mathbb{G}
\ A \cdot B \stackrel{\text{\href{#group-axioms}{G4}}}{=} I
\land \ B \cdot C \stackrel{\text{\href{#group-axioms}{G4}}}{=} I \\[2pt]
\Downarrow \\[2pt]
B \cdot A
\stackrel{\text{\href{#group-axioms}{G3}}}{=} (B \cdot A) \cdot I
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B \cdot A) \cdot (B \cdot C)
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (B \cdot (A \cdot B)) \cdot C
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (B \cdot I) \cdot C
\stackrel{\text{\href{#group-axioms}{G3}}}{=} B \cdot C
\stackrel{\text{\href{#group-axioms}{G4}}}{=} I
$$

</div>

</details>


#### Right identity is left identity (G10) {#right-identity-is-left-identity}

The [unique right identity](#uniqueness-of-right-identity) is also an identity element when applied from the left:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\forall\ A, B \in \mathbb{G}\ A \circ B \stackrel{\text{\href{#group-axioms}{G4}}}{=} E \\[2pt]
\Downarrow \\[2pt]
E \circ A
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (A \circ B) \circ A
\stackrel{\text{\href{#group-axioms}{G2}}}{=} A \circ (B \circ A)
\stackrel{\text{\href{#right-inverses-are-left-inverses}{G9}}}{=} A \circ E
\stackrel{\text{\href{#group-axioms}{G3}}}{=} A
$$

$$
\forall\ A, B \in \mathbb{G}\ A + B \stackrel{\text{\href{#group-axioms}{G4}}}{=} O \\[2pt]
\Downarrow \\[2pt]
O + A
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (A + B) + A
\stackrel{\text{\href{#group-axioms}{G2}}}{=} A + (B + A)
\stackrel{\text{\href{#right-inverses-are-left-inverses}{G9}}}{=} A + O
\stackrel{\text{\href{#group-axioms}{G3}}}{=} A
$$

$$
\forall\ A, B \in \mathbb{G}\ A \cdot B \stackrel{\text{\href{#group-axioms}{G4}}}{=} I \\[2pt]
\Downarrow \\[2pt]
I \cdot A
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (A \cdot B) \cdot A
\stackrel{\text{\href{#group-axioms}{G2}}}{=} A \cdot (B \cdot A)
\stackrel{\text{\href{#right-inverses-are-left-inverses}{G9}}}{=} A \cdot I
\stackrel{\text{\href{#group-axioms}{G3}}}{=} A
$$

</div>

Using the same reasoning as [above](#uniqueness-of-right-identity), the left identity is also unique.


#### Uniqueness of inverses (G11) {#uniqueness-of-inverses}

It follows that any two inverses of the same element are the same:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\forall\ A, B_1, B_2 \in \mathbb{G}\
A \circ B_1 \stackrel{\text{\href{#group-axioms}{G4}}}{=} E \land
A \circ B_2 \stackrel{\text{\href{#group-axioms}{G4}}}{=} E \\[2pt]
\Downarrow \\[2pt]
B_1 \stackrel{\text{\href{#group-axioms}{G3}}}{=} B_1 \circ E
\stackrel{\text{\href{#group-axioms}{G4}}}{=} B_1 \circ (A \circ B_2)
\stackrel{\text{\href{#group-axioms}{G2}}}{=} (B_1 \circ A) \circ B_2
\stackrel{\text{\href{#right-inverses-are-left-inverses}{G9}}}{=} E \circ B_2
\stackrel{\text{\href{#right-identity-is-left-identity}{G10}}}{=} B_2
$$

$$
\forall\ A, B_1, B_2 \in \mathbb{G}\
A + B_1 \stackrel{\text{\href{#group-axioms}{G4}}}{=} O \land
A + B_2 \stackrel{\text{\href{#group-axioms}{G4}}}{=} O \\[2pt]
\Downarrow \\[2pt]
B_1 \stackrel{\text{\href{#group-axioms}{G3}}}{=} B_1 + O
\stackrel{\text{\href{#group-axioms}{G4}}}{=} B_1 + (A + B_2)
\stackrel{\text{\href{#group-axioms}{G2}}}{=} (B_1 + A) + B_2
\stackrel{\text{\href{#right-inverses-are-left-inverses}{G9}}}{=} O + B_2
\stackrel{\text{\href{#right-identity-is-left-identity}{G10}}}{=} B_2
$$

$$
\forall\ A, B_1, B_2 \in \mathbb{G}\
A \cdot B_1 \stackrel{\text{\href{#group-axioms}{G4}}}{=} I \land
A \cdot B_2 \stackrel{\text{\href{#group-axioms}{G4}}}{=} I \\[2pt]
\Downarrow \\[2pt]
B_1 \stackrel{\text{\href{#group-axioms}{G3}}}{=} B_1 \cdot I
\stackrel{\text{\href{#group-axioms}{G4}}}{=} B_1 \cdot (A \cdot B_2)
\stackrel{\text{\href{#group-axioms}{G2}}}{=} (B_1 \cdot A) \cdot B_2
\stackrel{\text{\href{#right-inverses-are-left-inverses}{G9}}}{=} I \cdot B_2
\stackrel{\text{\href{#right-identity-is-left-identity}{G10}}}{=} B_2
$$

</div>

Given that every element of the group has an inverse
and that the inverse is unique for each element,
inversion is a [unary operation](https://en.wikipedia.org/wiki/Unary_operation) on the set of elements.
Instead of [quantifying](#universal-and-existential-quantifiers) the inverse as above,
we can use a much simpler notation for the inverse from now on:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="All">

$$
\forall\ A \in \mathbb{G}\ A \circ \overline{A} = \overline{A} \circ A = E
$$

$$
\forall\ A \in \mathbb{G}\ A + (-A) = (-A) + A = O
$$

$$
\forall\ A \in \mathbb{G}\ A \cdot A^{-1} = A^{-1} \cdot A = I
$$

</div>


#### Cancellation property (G12) {#cancellation-property}

Equality is also preserved when you remove the same element from both sides,
which is known as the [cancellation property](https://en.wikipedia.org/wiki/Cancellation_property):

<div class="tabbed aligned" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\begin{aligned}
\forall\ A, B, C \in \mathbb{G}\ A \circ C &= B \circ C \\
\stackrel{\text{\href{#preservation-of-equality}{G6}}}{\implies} (A \circ C) \circ \overline{C} &= (B \circ C) \circ \overline{C} \\
\stackrel{\text{\href{#group-axioms}{G2}}}{\implies} A \circ (C \circ \overline{C}) &= B \circ (C \circ \overline{C}) \\
\stackrel{\text{\href{#group-axioms}{G4}}}{\implies} A \circ E &= B \circ E \\
\stackrel{\text{\href{#group-axioms}{G3}}}{\implies} A &= B
\end{aligned}
$$

$$
\begin{aligned}
\forall\ A, B, C \in \mathbb{G}\ A + C &= B + C \\
\stackrel{\text{\href{#preservation-of-equality}{G6}}}{\implies} (A + C) + (-C) &= (B + C) + (-C) \\
\stackrel{\text{\href{#group-axioms}{G2}}}{\implies} A + (C + (-C)) &= B + (C + (-C)) \\
\stackrel{\text{\href{#group-axioms}{G4}}}{\implies} A + O &= B + O \\
\stackrel{\text{\href{#group-axioms}{G3}}}{\implies} A &= B
\end{aligned}
$$

$$
\begin{aligned}
\forall\ A, B, C \in \mathbb{G}\ A \cdot C &= B \cdot C \\
\stackrel{\text{\href{#preservation-of-equality}{G6}}}{\implies} (A \cdot C) \cdot C^{-1} &= (B \cdot C) \cdot C^{-1} \\
\stackrel{\text{\href{#group-axioms}{G2}}}{\implies} A \cdot (C \cdot C^{-1}) &= B \cdot (C \cdot C^{-1}) \\
\stackrel{\text{\href{#group-axioms}{G4}}}{\implies} A \cdot I &= B \cdot I \\
\stackrel{\text{\href{#group-axioms}{G3}}}{\implies} A &= B
\end{aligned}
$$

</div>


#### Unique solution (G13) {#unique-solution-revisited}

As we saw [earlier](#unique-solution),
the following equation has a unique solution in every group (also if the element to be determined is on the right):

<div class="tabbed aligned" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\begin{aligned}
\forall\ X, A, B \in \mathbb{G}\ X \circ A &= B \\
\stackrel{\text{\href{#preservation-of-equality}{G6}}}{\implies} (X \circ A) \circ \overline{A} &= B \circ \overline{A} \\
\stackrel{\text{\href{#group-axioms}{G2}}}{\implies} X \circ (A \circ \overline{A}) &= B \circ \overline{A} \\
\stackrel{\text{\href{#group-axioms}{G4}}}{\implies} X \circ E &= B \circ \overline{A} \\
\stackrel{\text{\href{#group-axioms}{G3}}}{\implies} X &= B \circ \overline{A}
\end{aligned}
$$

$$
\begin{aligned}
\forall\ X, A, B \in \mathbb{G}\ X + A &= B \\
\stackrel{\text{\href{#preservation-of-equality}{G6}}}{\implies} (X + A) + (-A) &= B + (-A) \\
\stackrel{\text{\href{#group-axioms}{G2}}}{\implies} X + (A + (-A)) &= B + (-A) \\
\stackrel{\text{\href{#group-axioms}{G4}}}{\implies} X + O &= B + (-A) \\
\stackrel{\text{\href{#group-axioms}{G3}}}{\implies} X &= B + (-A)
\end{aligned}
$$

$$
\begin{aligned}
\forall\ X, A, B \in \mathbb{G}\ X \cdot A &= B \\
\stackrel{\text{\href{#preservation-of-equality}{G6}}}{\implies} (X \cdot A) \cdot A^{-1} &= B \cdot A^{-1} \\
\stackrel{\text{\href{#group-axioms}{G2}}}{\implies} X \cdot (A \cdot A^{-1}) &= B \cdot A^{-1} \\
\stackrel{\text{\href{#group-axioms}{G4}}}{\implies} X \cdot I &= B \cdot A^{-1} \\
\stackrel{\text{\href{#group-axioms}{G3}}}{\implies} X &= B \cdot A^{-1}
\end{aligned}
$$

</div>

The solution is unique because any two solutions $$X_1$$ and $$X_2$$ are the same:

<div class="tabbed aligned" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\forall\ X_1, X_2, A, B \in \mathbb{G}\ X_1 \circ A = B \land X_2 \circ A = B \\[2pt]
\begin{aligned}
\stackrel{\text{\href{#properties-of-equality}{E3}}}{\implies} X_1 \circ A &= X_2 \circ A \\
\stackrel{\text{\href{#cancellation-property}{G12}}}{\implies} X_1 &= X_2
\end{aligned}
$$

$$
\forall\ X_1, X_2, A, B \in \mathbb{G}\ X_1 + A = B \land X_2 + A = B \\[2pt]
\begin{aligned}
\stackrel{\text{\href{#properties-of-equality}{E3}}}{\implies} X_1 + A &= X_2 + A \\
\stackrel{\text{\href{#cancellation-property}{G12}}}{\implies} X_1 &= X_2
\end{aligned}
$$

$$
\forall\ X_1, X_2, A, B \in \mathbb{G}\ X_1 \cdot A = B \land X_2 \cdot A = B \\[2pt]
\begin{aligned}
\stackrel{\text{\href{#properties-of-equality}{E3}}}{\implies} X_1 \cdot A &= X_2 \cdot A \\
\stackrel{\text{\href{#cancellation-property}{G12}}}{\implies} X_1 &= X_2
\end{aligned}
$$

</div>



#### Double inverse theorem (G14) {#double-inverse-theorem}

The inverse of the inverse is the original element again:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\forall\ A \in \mathbb{G}\ A \circ \overline{A} = E
\stackrel{\text{\href{#unique-solution-revisited}{G13}}}{\implies} A = E \circ \overline{\overline{A}}
\stackrel{\text{\href{#right-identity-is-left-identity}{G10}}}{\implies} A = \overline{\overline{A}}
$$

$$
\forall\ A \in \mathbb{G}\ A + (-A) = O
\stackrel{\text{\href{#unique-solution-revisited}{G13}}}{\implies} A = O + (-(-A))
\stackrel{\text{\href{#right-identity-is-left-identity}{G10}}}{\implies} A = -(-A)
$$

$$
\forall\ A \in \mathbb{G}\ A \cdot A^{-1} = I
\stackrel{\text{\href{#unique-solution-revisited}{G13}}}{\implies} A = I \cdot (A^{-1})^{-1}
\stackrel{\text{\href{#right-identity-is-left-identity}{G10}}}{\implies} A = (A^{-1})^{-1}
$$

</div>


#### Inversion of combination (G15) {#inversion-of-combination}

We can invert a combination of two elements by combining their inverses in reverse order:

<div class="tabbed" data-titles="Generic | Additive | Multiplicative | All" data-default="Generic">

$$
\forall\ A \in \mathbb{G}\ (A \circ B) \circ (\overline{B} \circ \overline{A})
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (A \circ (B \circ \overline{B})) \circ \overline{A}
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (A \circ E) \circ \overline{A}
\stackrel{\text{\href{#group-axioms}{G3}}}{=} A \circ \overline{A}
\stackrel{\text{\href{#group-axioms}{G4}}}{=} E \\[3pt]
\Downarrow\text{\scriptsize{\href{#uniqueness-of-inverses}{G11}}} \\[4pt]
\overline{A \circ B} = \overline{B} \circ \overline{A}
$$

$$
\forall\ A \in \mathbb{G}\ (A + B) + ((-B) + (-A))
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (A + (B + (-B))) + (-A)
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (A + O) + (-A)
\stackrel{\text{\href{#group-axioms}{G3}}}{=} A + (-A)
\stackrel{\text{\href{#group-axioms}{G4}}}{=} O \\[3pt]
\Downarrow\text{\scriptsize{\href{#uniqueness-of-inverses}{G11}}} \\[4pt]
-(A + B) = (-B) + (-A)
$$

$$
\forall\ A \in \mathbb{G}\ (A \cdot B) \cdot (B^{-1} \cdot A^{-1})
\stackrel{\text{\href{#generalized-associative-law}{G7}}}{=} (A \cdot (B \cdot B^{-1})) \cdot A^{-1}
\stackrel{\text{\href{#group-axioms}{G4}}}{=} (A \cdot I) \cdot A^{-1}
\stackrel{\text{\href{#group-axioms}{G3}}}{=} A \cdot A^{-1}
\stackrel{\text{\href{#group-axioms}{G4}}}{=} I \\[3pt]
\Downarrow\text{\scriptsize{\href{#uniqueness-of-inverses}{G11}}} \\[4pt]
(A \cdot B)^{-1} = B^{-1} \cdot A^{-1}
$$

</div>


*[a.m.]: ante meridiem (before midday)
*[BCE]: Before the Common Era
*[CE]: Common Era
*[CRT]: Chinese Remainder Theorem
*[DL]: Discrete Logarithm
*[DLP]: Discrete-Logarithm Problem
*[EC]: Elliptic Curve
*[ECC]: Elliptic-Curve Cryptography
*[ECDLP]: Elliptic-Curve Discrete-Logarithm Problem
*[GCD]: Greatest Common Divisor
*[GF]: Galois Field
*[LCM]: Least Common Multiple
*[NIST]: National Institute of Standards and Technology
*[OEIS]: On-Line Encyclopedia of Integer Sequences
*[PDFs]: Portable Document Format
*[p.m.]: post meridiem (after midday)
*[PRNG]: Pseudo-Random Number Generator
*[SEC]: Standards for Efficient Cryptography
*[SECG]: Standards for Efficient Cryptography Group
*[sqrt]: SQuare RooT
