---
layout: toc
title: Explained from First Principles
regenerate: true
author: Kaspar Etter
image: generated/focus.thumbnail.png
---

# {{ site.title }}

Welcome to {{ site.title }},
a technology, science, and philosophy blog for curious people
who want to understand and change the world.
In order to make you feel at home here as quickly as possible,
here is what you should know about this blog.


## Content

### Focus

<figure markdown="block">
{% include_relative generated/focus.embedded.svg %}
<figcaption markdown="span">
This blog gets [to the bottom](https://en.wikipedia.org/wiki/Reductionism)
of technical concepts and scientific theories.
</figcaption>
</figure>


### Articles

The following articles have been published on this blog:

{% assign articles = site.pages | where_exp: "article", "article.category" | where_exp: "article", "article.published" | sort: "published" | reverse %}
<div class="custom-row">
{% for article in articles %}
  <div class="custom-column">
    <a class="custom-card" href="{{ article.url | relative_url }}">
      <div class="custom-card-image">

{% include_relative {{ article.image | replace: ".thumbnail.png", ".embedded.svg" }} %}
      </div>
      <div class="custom-card-title">{{ article.title }}</div>
      <div class="custom-card-text">{{ article.teaser }}</div>
      <div class="custom-card-date">{{ article.published | date: site.date_format }}</div>
    </a>
  </div>
{% endfor %}
</div>

### Categories

The topics on this blog fall into one of the following categories:

{% for category in site.data.categories %}
- <i class="fas fa-{{ category.icon }}"></i>{{ category.name }}: {{ category.description }}{% endfor %}

### Ambition

The goal of this website is to provide the best introduction available to the covered subjects.
After doing a lot of research about a particular topic,
I write the articles for my past self
in the hope they are useful to the present you.
Each article is intended to be the first one
that you should read about a given topic
and also the last
— unless you want to become a real expert on the subject matter.
I try to explain all concepts
as much as possible from [first principles](https://en.wikipedia.org/wiki/First_principle),
which means that all your why questions should be answered by the end of an article.
I strive to make the explanations comprehensible
with no prior knowledge beyond a high-school education.
If this is not the case for you,
please [let me know](#contact).

### Quality

As is the case for all humans,
my expertise is limited.
Given the wide range of topics I cover,
I cannot be an expert in all of them.
I try to check empirical facts and study normative statements as well as possible,
but unlike schools and [Wikipedia](https://en.wikipedia.org/wiki/Main_Page),
the content on this blog is intentionally opinionated.
If you don't like this,
then a different website is just a click away.
I believe that the judgement of theories
is just as important as the theories themselves
— given the right amount of intellectual humility
as opinions can and should evolve with new considerations.
The problem with learning is
that the more you understand,
the more you understand
what you don’t understand.
While going down the rabbit hole of a topic can be a lot of fun,
I have to stop my research at some point
in order not to paralyze myself.
Therefore, if I'm mistaken about facts,
please bring it to [my attention](#contact).
If you disagree with my conclusions,
then write a rebuttal.
If your rebuttal contributes to a civilized debate,
I will consider adding a link to it.
I endeavor to make my arguments free from
[logical fallacies](https://en.wikipedia.org/wiki/Formal_fallacy) and
[cognitive biases](https://en.wikipedia.org/wiki/Cognitive_bias),
but my rationality — unlike my curiosity — is also bounded.

### Length

In order to truly understand
why things are the way they are and not different,
you have to put in a lot of effort.
But as with many things in life,
the more you put into it,
the more you get out of it.
To respect your time,
I try to write as succinctly as I can,
which makes the information density really high.
However, complex concepts simply require a lot of words to explain them properly.
Anything that I cannot explain properly
because I don't understand it properly,
I omit from my articles.
If a topic or section does not interest you,
you should skip it rather than waste your time.
I put a lot of thought into the structure of the articles
to make the sections as easy to skim, skip, and digest as possible.

### License

<span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">{{ site.title }}</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://www.kasparetter.com" property="cc:attributionName" rel="cc:attributionURL">Kaspar Etter</a> is licensed under the <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.

### Liability

While I researched the content on this website thoroughly,
you take or omit actions based on it at your own risk.
In no event shall I as the author be liable
for any damages arising from information or advice
on this website or on referenced websites.


## Navigation

In order to make this blog as useful as possible,
I added the following features for you.
If you have ideas for improvement,
[tell me](#contact).

### Table of contents

The table of contents is generated to the left on bigger screens
and accessible through the button in the lower right corner on smaller screens.
It contains two levels of titles,
which are automatically expanded on bigger screens
and always expanded on smaller screens.
As the current section is highlighted,
you always know where you are,
which is crucial to grasp complex topics.

### Behavior of links

If you click on a green link, which references a different section on the same page,
a new entry in your browser history is generated
so that you can easily go back to where you were before you clicked the link.
A click on a blue link opens the referenced page in a new window or tab.
Like this, you never have to worry
that you lose your current position.
Let's just try it:
[Click here](#about)
and then back.

### Browser address

When you scroll through an article,
your browser address is updated continuously
in order to always link to the current section.
While this can create a lot of entries in your browser history,
it helps you find more easily where you left off,
especially on mobile,
where a page reload is forced upon you.
If you want to share an article
without linking to a particular section,
make sure to remove everything in the address from the hash onward.
Alternatively, simply scroll to the top of the page before copying the address.

### Section links

If you want to share a link to a specific section,
just click on the green icon after the title
in order to copy the exact address to the clipboard of your device.
On devices with a mouse,
the green link icon is only shown
when you hover your mouse over the title.

### Section skipping

If a section does not interest you,
you can click on the text of its title
to advance to the next section of the same or a higher level.

### Information boxes

Articles contain boxes with additional information,
which you can open and close by clicking on their title.

<details markdown="block" open>
<summary markdown="span" id="recommended-reading">
Recommended reading
</summary>

Boxes which start out open contain explanations
that are important to follow the main narrative.
Their content doesn't fit the structure of the article
or is self-contained enough to warrant its own box.
In either case, the article may refer to such boxes.

</details>

<details markdown="block">
<summary markdown="span" id="optional-reading">
Optional reading
</summary>

Boxes which start out closed contain side notes
that can be skipped without impairing the main topic.
Sometimes I just like to digress.
Other times,
such boxes contain background information
which is too technical for a general audience.
In either case,
you might miss out on interesting little details
if you don't open them.
However, if an article already feels too long or advanced to you,
I suggest that you simply skip all closed boxes
when you read the article for the first time.

</details>

### Dark and light mode

If you prefer dark text on a white background,
you can toggle the style by clicking on the last entry of the navigation bar at the top.

### History of values

Many articles contain interactive elements,
which allow you to play around with some concepts.
In order to revisit earlier examples later on,
the values you enter are stored
[locally in your browser](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).
You can go back and forth through the history of values
by clicking on the corresponding button.
The values are persisted across sessions:
If you close the browser window
and then open the article again,
the entered values are still there.
You can erase the history
by clicking the button with the trash icon.
If you don't want the entered values to be persisted across sessions in the first place,
then open the article in the [private mode](https://en.wikipedia.org/wiki/Private_browsing)
of your web browser.

### Article download

Each article can be downloaded as a PDF for printing or offline reading.
You find the download link at the very top of the corresponding article.
The printing feature of your browser also works, of course,
but I cannot ensure that the article will be formatted nicely this way.
Additionally, only the open information boxes will be printed
if you export the article yourself.

### Graphics export

By right-clicking a graphic with your mouse
(or by double-clicking it on a touch device),
you can download the graphic
as a pixel image (in the PNG format)
or as a vector graphic (in the SVG format).
You can use the graphics on this blog for anything you want
as long as you give appropriate credit,
indicate if you made changes,
and don't suggest that I endorse you
(see [the license](#license) above).

### Acronym tooltips

While I generally try to avoid acronyms,
sometimes they're better known than what they stand for.
Whenever you encounter an acronym on this website,
you can hover with your mouse over it
(or click on it on a touch device)
to get a tooltip with their full name.
You can try this with PDF, PNG, and SVG.


## Transparency

All expenses of this blog in terms of time and money
have been paid by myself until now.
I pledge to disclose any conflicts of interest,
whenever they might impact the content on this blog.
Excluded from this are consulting work and paid seminars
based on content that has already been published,
as long as they don't result in modifications
to this website beyond general improvements.


## Contact

Do not hesitate to [contact me](mailto:contact@ef1p.com)
if you have feedback, questions or suggestions for topics to write about.
Please also let me know if an explanation is hard to follow.
If you found a typographical error, a factual inaccuracy or a logical fallacy,
you can also [create an issue](https://github.com/KasparEtter/ef1p/issues/new).


## Privacy

- I use [Google Analytics](https://analytics.google.com) to track site visitors.
  If you hate being tracked,
  you can deactivate this [in your browser](https://tools.google.com/dlpage/gaoptout).
- I announce new articles on [Twitter](https://twitter.com) and [Telegram](https://telegram.org).
  If you don't like these companies, then don't use their services.
- This site is hosted with [GitHub Pages](https://pages.github.com),
  which means that [Microsoft](https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/)
  also learns when and from where this blog is being accessed.
- Interactive elements in articles may send personal information to other companies as well.
  If they do, this is explicitly stated in the paragraph before the corresponding input field.
  Otherwise, all the values you enter are only stored
  [locally in your browser](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).


## About

My name is [Kaspar Etter](https://www.kasparetter.com)
and I'm a curious and skeptic person.
I studied computer science at [ETH](https://ethz.ch/en.html)
and live in Zurich, Switzerland.

*[PDF]: Portable Document Format
*[PNG]: Portable Network Graphics
*[SVG]: Scalable Vector Graphics
