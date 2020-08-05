<figure markdown="block"{% if include.limited-width-on-print %} class="limited-width-on-print"{% endif %}>{% if include.themed %}{% assign splits = include.source | split: "." %}{% assign name = splits[0] %}{% assign extension = splits[1] %}{% if include.scaled %}{% assign sizes = "500,1000,2000" | split: "," %}
{% capture srcset-light %}{% for size in sizes %}, generated/{{name}}-light.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}<img srcset="{{ srcset-light | remove_first: ", " }}" src="generated/{{name}}-light.{{sizes[2]}}.{{extension}}" class="light-theme-only" />
{% capture srcset-dark %}{% for size in sizes %}, generated/{{name}}-dark.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}<img srcset="{{ srcset-dark | remove_first: ", " }}" src="generated/{{name}}-dark.{{sizes[2]}}.{{extension}}" class="dark-theme-only" />{% else %}
<img src="{{name}}-light.{{extension}}" class="light-theme-only" />
<img src="{{name}}-dark.{{extension}}" class="dark-theme-only" />{% endif %}{% else %}{% if include.scaled %}{% assign splits = include.source | split: "." %}{% assign name = splits[0] %}{% assign extension = splits[1] %}{% assign sizes = "500,1000,2000" | split: "," %}
{% capture srcset %}{% for size in sizes %}, generated/{{name}}.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}<img srcset="{{ srcset | remove_first: ", " }}" src="generated/{{name}}.{{sizes[2]}}.{{extension}}" />{% else %}
<img src="{{ include.source }}" />{% endif %}{% endif %}{% if include.caption %}
<figcaption markdown="span">{{ include.caption }}</figcaption>{% endif %}
</figure>
