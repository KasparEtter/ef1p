{% assign path = page.name | remove_first: ".md" | prepend: "/pages/" %}
{% assign splits = include.source | split: "." %}
{% assign name = splits[0] %}
{% assign extension = splits[1] %}
{% assign sizes = "500,1000,2000" | split: "," %}
{% capture style %}{% if include.image-max-width %} style="max-width: {{include.image-max-width}}px;"{% endif %}{% endcapture %}
<figure markdown="block"{% unless include.full-width-on-print %} class="limited-width-on-print"{% endunless %}>
{% if include.themed %}
    {% if include.scaled %}
        {% capture srcset-light %}{% for size in sizes %}, {{path}}/generated/{{name}}.light.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}
<img srcset="{{ srcset-light | remove_first: ', ' }}" src="{{path}}/generated/{{name}}.light.{{sizes[2]}}.{{extension}}" class="light-theme-only"{{style}} />
        {% capture srcset-dark %}{% for size in sizes %}, {{path}}/generated/{{name}}.dark.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}
<img srcset="{{ srcset-dark | remove_first: ', ' }}" src="{{path}}/generated/{{name}}.dark.{{sizes[2]}}.{{extension}}" class="dark-theme-only"{{style}} />
    {% else %}
<img src="{{path}}/images/{{name}}.light.{{extension}}" class="light-theme-only"{{style}} />
<img src="{{path}}/images/{{name}}.dark.{{extension}}" class="dark-theme-only"{{style}} />
    {% endif %}
{% else %}
    {% if include.scaled %}
        {% capture srcset %}{% for size in sizes %}, {{path}}/generated/{{name}}.{{size}}.{{extension}} {{size}}w{% endfor %}{% endcapture %}
<img srcset="{{ srcset | remove_first: ', ' }}" src="{{path}}/generated/{{name}}.{{sizes[2]}}.{{extension}}"{{style}} />
    {% else %}
<img src="{{path}}/images/{{ include.source }}"{{style}} />
    {% endif %}
{% endif %}
{% if include.caption %}
<figcaption markdown="span"{% if include.caption-max-width %} style="max-width: {{include.caption-max-width}}px;"{% endif %}>{{ include.caption }}</figcaption>
{% endif %}
</figure>
