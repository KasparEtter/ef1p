{% capture style %}{% if include.max-width %} style="max-width: {{include.max-width}}px;"{% endif %}{% endcapture %}
<figure markdown="block"{% unless include.full-width-on-print %} class="limited-width-on-print"{% endunless %}>{% if include.themed %}{% assign splits = include.source | split: "." %}{% assign name = splits[0] %}{% assign extension = splits[1] %}{% if include.scaled %}{% assign sizes = "500,1000,2000" | split: "," %}
{% capture srcset-light %}{% for size in sizes %}, generated/{{name}}.light.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}<img srcset="{{ srcset-light | remove_first: ", " }}" src="generated/{{name}}.light.{{sizes[2]}}.{{extension}}" class="light-theme-only"{{style}} />
{% capture srcset-dark %}{% for size in sizes %}, generated/{{name}}.dark.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}<img srcset="{{ srcset-dark | remove_first: ", " }}" src="generated/{{name}}.dark.{{sizes[2]}}.{{extension}}" class="dark-theme-only"{{style}} />{% else %}
<img src="images/{{name}}.light.{{extension}}" class="light-theme-only"{{style}} />
<img src="images/{{name}}.dark.{{extension}}" class="dark-theme-only"{{style}} />{% endif %}{% else %}{% if include.scaled %}{% assign splits = include.source | split: "." %}{% assign name = splits[0] %}{% assign extension = splits[1] %}{% assign sizes = "500,1000,2000" | split: "," %}
{% capture srcset %}{% for size in sizes %}, generated/{{name}}.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}<img srcset="{{ srcset | remove_first: ", " }}" src="generated/{{name}}.{{sizes[2]}}.{{extension}}"{{style}} />{% else %}
<img src="images/{{ include.source }}"{{style}} />{% endif %}{% endif %}{% if include.caption %}
<figcaption markdown="span">{{ include.caption }}</figcaption>{% endif %}
</figure>
