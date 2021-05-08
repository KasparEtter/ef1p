---
layout: toc
title: Explained from First Principles
permalink: /index.html
author: Kaspar Etter
regenerate: true
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

{% include_relative {{ article.name | replace: ".md", ".svg" | prepend: "thumbnails/" }} %}
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
- <i class="icon-left fas fa-{{ category.icon }}"></i>{{ category.name }}: {{ category.description }}{% endfor %}
{:.compact}


### Ambition

The goal of this website is to provide the best introduction available to the covered subjects.
After doing a lot of research about a particular topic,
I write the articles for my past self in the hope they are useful to the present you.
Each article is intended to be the first one that you should read about a given topic
and also the last — unless you want to become a real expert on the subject matter.
I try to explain all concepts as much as possible from [first principles](https://en.wikipedia.org/wiki/First_principle),
which means that all your "why" questions should be answered by the end of an article.
I strive to make the explanations comprehensible with no prior knowledge beyond a high-school education.
If this is not the case for you, please [let me know](#contact).


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
I believe that the judgement of theories is just as important as the theories themselves,
given the right amount of intellectual humility as opinions can and should evolve with new considerations.
The problem with learning is that the more you understand,
the more you understand what you don’t understand.
While going down the rabbit hole of a topic can be a lot of fun,
I have to stop my research at some point in order not to paralyze myself.
Therefore, if I'm mistaken about facts,
please bring it to [my attention](#contact).
If you disagree with my conclusions,
then write a rebuttal.
If your rebuttal contributes to a civilized debate,
I will consider adding a link to it.


### Length

In order to truly understand why things are the way they are and not different,
you have to put in a lot of effort.
But as with many things in life,
the more you put into it,
the more you get out of it.
To respect your time,
I try to write as succinctly as I can,
which makes the information density really high.
However, complex concepts simply require a lot of words to explain them properly.
If a topic or section does not interest you,
you should skip it rather than waste your time.
I put a lot of thought into the structure of the articles
to make the sections as easy to skim, skip, and digest as possible.


### License

<span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">{{ site.title }}</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="https://kasparetter.com" property="cc:attributionName" rel="cc:attributionURL">Kaspar Etter</a> is licensed under the <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.


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
Like this, you never have to worry that you lose your current position.
Let's just try it:
[Click here](#about) and then back.


### Browser address

When you scroll through an article,
your browser address is updated continuously
in order to always link to the current section.
While this can create a lot of entries in your browser history,
it helps you find more easily where you left off,
especially on mobile,
where a page reload is forced upon you.
If you want to share an article without linking to a particular section,
make sure to remove everything in the address from the hash onward.
Alternatively, simply scroll to the top of the page before copying the address.


### Section links

If you want to share a link to a specific section,
just click on the green icon after the title
in order to copy the exact address to the clipboard of your device.
On devices with a mouse,
the green link icon is shown only
when you hover your mouse over the title.


### Section skipping

If a section does not interest you,
you can click on the text of its title
to advance to the next section of the same or a higher level.


### Information boxes

Articles contain boxes with additional information,
which you can open and close by clicking on their title.
If you want to expand all boxes,
you can click on "Expand" in the navigation bar.
This is useful for including all boxes
when searching for a phrase on a page.

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
by clicking on the corresponding buttons.
The values are persisted across sessions:
If you close the browser window
and then open the article again,
the entered values are still there.
You can erase the history
by clicking the button with the trash icon.
If you don't want the entered values to be persisted across sessions in the first place,
then open the article in the [private mode](https://en.wikipedia.org/wiki/Private_browsing)
of your web browser.
If you want, you can <a id="erase-all-values">erase all stored values</a>,
including your theme preference.


### Article download

Each article can be downloaded as a PDF for printing or offline reading.
You find the download link at the very top of the corresponding article.
The printing feature of your browser also works, of course,
but I cannot ensure that the article will be formatted nicely this way.
Additionally, only the open [information boxes](#information-boxes) will be printed
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
(see the [license](#license) above).


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
have been paid by myself [until now](#donate).
I pledge to disclose any conflicts of interest,
whenever they might impact the content on this blog.
Excluded from this are consulting work and paid seminars
based on content that has already been published,
as long as they don't result in modifications
to this website beyond general improvements.


## Contact

Do not hesitate to [contact me](mailto:contact@ef1p.com)
if you have feedback, questions, or suggestions for topics to write about.
Please also let me know if an explanation is hard to follow.
If you found a typographical error, a factual inaccuracy or a logical fallacy,
you can also [create an issue](https://github.com/KasparEtter/ef1p/issues/new).


## Donate

It already means a lot to me if you read and share my articles.
If you have a regular income and learned something from my articles,
I would really appreciate your financial support.
You can support me on
[GitHub](https://github.com/sponsors/KasparEtter),
[Liberapay](https://liberapay.com/ef1p/),
[Patreon](https://www.patreon.com/ef1p),
and [PayPal](https://paypal.me/KasparEtter).
You can also donate some Bitcoin to `bc1q4fsulplawjucrw9sz0swgu6thgk24fn03wttrrcesut2nsq0zwgsepveep`
[↗](https://blockstream.info/address/bc1q4fsulplawjucrw9sz0swgu6thgk24fn03wttrrcesut2nsq0zwgsepveep).
Any amount is greatly appreciated.


## Privacy

- I announce new articles on [Twitter](https://twitter.com/{{ site.twitter_handle }}),
  [Reddit]({{ site.reddit_community }}) and [Telegram]({{ site.telegram_channel }}).
  If you don't like these companies, then simply don't use their services.
- I use [Plausible Analytics](https://plausible.io/) to measure how people interact with this website. Plausible Analytics
  collects [no personal information](https://plausible.io/privacy-focused-web-analytics#no-personal-data-is-collected),
  uses [no cookies](https://plausible.io/privacy-focused-web-analytics#no-cookies-and-other-persistent-identifiers), and
  isolates all data [to a single day](https://plausible.io/privacy-focused-web-analytics#all-data-is-isolated-to-a-single-day).
  In order to be as transparent as possible,
  I gladly share [my analytics](https://plausible.io/explained-from-first-principles.com) with you.
- This site is hosted with [GitHub Pages](https://pages.github.com),
  which means that [Microsoft](https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/)
  also learns when and from where this blog is being accessed.
- Interactive elements in articles may send personal information to other companies as well.
  If they do, this is explicitly stated in the paragraph before the corresponding input field.
  Otherwise, all the values you enter are stored only
  [locally in your browser](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).


## About

My name is [Kaspar Etter](https://kasparetter.com) and I'm a curious and skeptic person.
I studied computer science at [ETH](https://ethz.ch/en.html) and live in Zurich, Switzerland.


## FAQ

Here are answers to [frequently asked questions (FAQ)](https://en.wikipedia.org/wiki/FAQ):


### Can't you write shorter articles?
{:data-toc-text="Article length"}

I guess I could,
but I also believe that length is the [wrong metric](https://en.wikipedia.org/wiki/Attribute_substitution).
Whether a text is worth reading should be judged by the number of insights per word
and not by the number of words.
Your opinion may vary,
but I think I'm doing pretty well on this metric.


### Why don't you split your long articles into smaller ones?
{:data-toc-text="Article splitting"}

In my opinion, scrolling is easier than clicking,
especially when you just want to skim a text.
Having everything on a single page is also friendlier for offline reading
and for using your browser's search functionality to find what you're looking for.
The biggest reason for splitting long articles into smaller ones is
[search engine optimization (SEO)](https://en.wikipedia.org/wiki/Search_engine_optimization).
It would also have the desirable side effect of allowing me to post new content more often.
For now, I'm willing to sacrifice both in favor of making my content as useful as possible
but my view on this might change in the future.


### How often do you intend to publish articles?
{:data-toc-text="Article frequency"}

My primary goal is to do justice to the chosen topics.
The topics I'm interested in are usually quite involved.
I intend to publish between two and four articles a year.
In order to achieve this, I will likely alternate between large and small topics in the future.


### Have you considered creating videos about your content?
{:data-toc-text="Video format"}

Yes, but I think it's neither a good fit for me nor for my content.
I see a lot of value in [edutainment](https://en.wikipedia.org/wiki/Educational_entertainment)
and there are many great channels in this area, which I watch regularly.
However, written text has many advantages when you truly want to learn something:
You can read at your own pace,
reread paragraphs when necessary,
recognize the structure of an argument,
copy fragments into your notes,
and search for terms of interest.
In comparison to videos,
text is also much easier to make interactive
and to update after publishing.
Last but not least, the [World Wide Web (WWW)](https://en.wikipedia.org/wiki/World_Wide_Web)
allows me to link to additional explanations and to cite the relevant sources.


### Have you considered publishing your articles as books?
{:data-toc-text="Book format"}

Not really.
I think that books are an outdated format for most purposes.
On the one hand, books lack the concept of [hyperlinks](https://en.wikipedia.org/wiki/Hyperlink):
You cannot easily link into the text and out of it.
On the other hand, books cannot have interactive elements,
which often make learning so much easier.
Regarding monetization, I'm not a fan of [paywalls](https://en.wikipedia.org/wiki/Paywall).
I believe that information shall be freely accessible and shareable
as long as it does [more good than harm](https://en.wikipedia.org/wiki/Information_hazard).
In my opinion, the Web is the ideal publishing platform.
But we'll see what the future holds.


### What software do you use to create the graphics?
{:data-toc-text="Graphics tool"}

I wrote [my own SVG framework](https://github.com/KasparEtter/ef1p/tree/main/code/svg)
because I couldn't find a solution which matched my needs.
I wanted to be able to style the scalable vector graphics with the page-wide [CSS](https://en.wikipedia.org/wiki/CSS)
so that [the theme can be toggled](#dark-and-light-mode) without having to replace the graphics.
The support for [CSS classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors) wasn't great
in the [vector graphics editors](https://en.wikipedia.org/wiki/Vector_graphics_editor) that I've checked.
Using code instead of a [graphical user interface (GUI)](https://en.wikipedia.org/wiki/Graphical_user_interface)
to create vector graphics has the advantage that graphics can build on one another and share common functionality.
It also makes it straightforward to [compile](https://en.wikipedia.org/wiki/Compiler) a single graphic in different ways.
I wanted the graphics to be generated ahead of time so that they can be used for other purposes as well.
All major SVG libraries, however,
manipulate a [document object model (DOM)](https://en.wikipedia.org/wiki/Document_Object_Model).
While there are workarounds to run them on a server,
such as using a [headless browser](https://en.wikipedia.org/wiki/Headless_browser)
or a [DOM library](https://github.com/jsdom/jsdom),
I decided to roll my own little SVG library, which grew over time.
It is heavily tailored to my needs and my [design language](https://en.wikipedia.org/wiki/Design_language)
but if there's enough interest, I'm open to splitting the framework into its own repository.


*[CSS]: Cascading Style Sheets
*[DOM]: Document Object Model
*[FAQ]: Frequently Asked Questions
*[GUI]: Graphical User Interface
*[PDF]: Portable Document Format
*[PNG]: Portable Network Graphics
*[SEO]: Search Engine Optimization
*[SVG]: Scalable Vector Graphics
*[WWW]: World Wide Web
