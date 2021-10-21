---
title: Email tools
author: Kaspar Etter
license: CC BY 4.0
teaser: Play around with the tools from the article about email.
permalink: /email/tools/
---

# [Email](/email/) tools

Each title takes you to where the respective tool is explained.


## Lookups


### [Configuration database](/email/#configuration-database)

<div id="tool-lookup-configuration-database"></div>


### [SRV records](/email/#autoconfiguration)

<div id="tool-lookup-srv-records"></div>


### [MX records](/email/#address-resolution)

<div id="tool-lookup-mx-records"></div>


### [SPF record](/email/#sender-policy-framework)

<div id="tool-lookup-spf-record"></div>


### [DKIM record](/email/#domainkeys-identified-mail)

<div id="tool-format-dkim"></div>
<div id="tool-lookup-dkim-record" class="mt-3"></div>


### [DMARC record](/email/#domain-based-message-authentication-reporting-and-conformance)

<div id="tool-format-dmarc"></div>
<div id="tool-lookup-dmarc-record" class="mt-3"></div>


### [BIMI record](/email/#brand-indicators-for-message-identification)

<div id="tool-lookup-bimi-record"></div>


### [TLSA records](/email/#dns-based-authentication-of-named-entities)

<div id="tool-lookup-tlsa-records"></div>


### [MTA-STS policy](/email/#mail-transfer-agent-strict-transport-security)

<div id="tool-lookup-mta-sts-policy"></div>


### [TLS Reporting record](/email/#smtp-tls-reporting)

<div id="tool-lookup-tls-reporting"></div>


### [SMIMEA records](/email/#smimea-resource-record)

<div id="tool-lookup-smimea-records"></div>


### [OPENPGPKEY records](/email/#openpgpkey-resource-record)

<div id="tool-lookup-openpgpkey-records"></div>


## Protocols


### [ESMTP](/email/#esmtp-tool)

<div id="tool-protocol-esmtp"></div>

**Examples:**
- <a class="bind-esmtp-example" href="#tool-protocol-esmtp" data-content="text/enriched" data-body="<bold>Roses</bold> <italic>are</italic>\n<color><param>red</param>red</color>." title="Set the body of the ESMTP tool to a text/enriched example.">`text/enriched`</a>
- <a class="bind-esmtp-example" href="#tool-protocol-esmtp" data-content="text/html" data-body="<html>\n  <body>\n    <b>Roses</b> <i>are</i>\n    <span style=&quot;color:red;&quot;>red</span>.\n  </body>\n</html>" title="Set the body of the ESMTP tool to a text/html with inline CSS example.">`text/html` with inline CSS</a>
- <a class="bind-esmtp-example" href="#tool-protocol-esmtp" data-content="text/html" data-body="<html>\n  <head>\n    <style type=&quot;text/css&quot;>\n      a { color: red; }\n    </style>\n  </head>\n  <body>\n    <a href=&quot;https://en.wikipedia.org/wiki/Roses_Are_Red&quot;>Roses are red</a>.\n  </body>\n</html>" title="Set the body of the ESMTP tool to a text/html with internal CSS example.">`text/html` with internal CSS</a>
- <a class="bind-esmtp-example" href="#tool-protocol-esmtp" data-content="multipart/mixed" data-body="--UniqueBoundary\nContent-Type: text/plain\nContent-Transfer-Encoding: 7bit\n\nThis message has an attachment.\n\n--UniqueBoundary\nContent-Type: image/png\nContent-Transfer-Encoding: base64\n\niVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsSAAAL\nEgHS3X78AAAB4klEQVQ4y5VVwU7CQBDdKl5IVz8Fg95ZQH+BhBP/UEAxKv/AN3jG\n/1ATPeqlJr169WRpi/NmZ8uCEGqTl53OzrzO7MxOVdiKFB6s2gwDkeuEAeGRkBAW\ngkR02KvDFj4+hxMCpUq5T4h1d7LU3Zulbo+X5GQBGToC2XzC1vML1lmtPGMiciQ5\nI/xgBRmtBSFHpPS+0O0rRzzz/JWf5kxf3CKSQneusea8whGyjbIQ4kI+lMHHkTou\nTpMjA5kZpoQpoUnoEeJ1UiKzdiDKmdRG2ldeAWI+HxvZvfIeem9wihKhO09EKWuG\nD4KDC4WKITpJAUbnQnREugOR3+RjWVkgkMkR8AdtlAMQzj1C4ExIHNkh4XkbIaff\nYlJHOAdhos3IpbCN8IDw4hHmshZeoXLpjERJG7jNfYSpd9ZloUIj52mixT8IqdId\nrvYX4bXsxVVLlYRVUn46vryD0wPhRPSnrqVC+Hkp7ytKwFU2w29CKK1Wk70e0seN\n8otSpW0+CO9MZqIa9kSP5s85QssxqNrYLvrGxt7UXs/xqrGrXb2xmzqx6Jpik6IX\nJbq+8i90heGQs+zvwXZzOFQdX+7ess5EmZ2Nk7/ja/+AHXkDdiQDduLObPeA3fEL\nmMvYTwWJ6Hb+An4Bgrjq/fe5+zgAAAAASUVORK5CYII=\n\n--UniqueBoundary--" title="Set the body of the ESMTP tool to a multipart/mixed example.">`multipart/mixed`</a>
- <a class="bind-esmtp-example" href="#tool-protocol-esmtp" data-content="multipart/mixed" data-body="--UniqueBoundary\nContent-Type: text/plain; charset=us-ascii\n\nHello, I've attached the source code of the exercise.\n\n--UniqueBoundary\nContent-Type: text/plain; charset=us-ascii\nContent-Disposition: attachment; filename=HelloWorld.c\n\n#include <stdio.h>\n\nint main() {\n  printf(&quot;Hello, World!&quot;);\n  return 0;\n}\n\n--UniqueBoundary--" title="Set the body of the ESMTP tool to a multipart/mixed with content disposition example.">`multipart/mixed` with content disposition</a>
- <a class="bind-esmtp-example" href="#tool-protocol-esmtp" data-content="multipart/mixed" data-body="Preamble, which is ignored by MIME-supporting clients.\n\n--UniqueBoundary\n\nPart 1 with an implicit content type of text/plain.\n\n--UniqueBoundary\nContent-Type: text/plain; charset=us-ascii\n\nPart 2 with an explicit content type of text/plain.\n\n--UniqueBoundary--\n\nEpilogue, which is ignored by MIME-supporting clients." title="Set the body of the ESMTP tool to a multipart/mixed with preamble and epilogue example.">`multipart/mixed` with preamble and epilogue</a>
- <a class="bind-esmtp-example" href="#tool-protocol-esmtp" data-content="multipart/alternative" data-body="--UniqueBoundary\nContent-Type: text/plain\n\nRoses are red.\n\n--UniqueBoundary\nContent-Type: text/enriched\n\n<bold>Roses</bold> <italic>are</italic>\n<color><param>red</param>red</color>.\n\n--UniqueBoundary\nContent-Type: text/html\n\n<html>\n  <body>\n    <b>Roses</b> <i>are</i>\n    <span style=&quot;color:red;&quot;>red</span>.\n  </body>\n</html>\n\n--UniqueBoundary--" title="Set the body of the ESMTP tool to a multipart/alternative example.">`multipart/alternative`</a>
- <a class="bind-esmtp-example" href="#tool-protocol-esmtp" data-content="multipart/related" data-body="--UniqueBoundary\nContent-Type: multipart/alternative; boundary=&quot;InnerBoundary&quot;\n\n--InnerBoundary\nContent-Type: text/plain; charset=us-ascii\n\nhttps://ef1p.com\n\n--InnerBoundary\nContent-Type: text/html; charset=us-ascii\n\n<html>\n  <body>\n    <a href=&quot;https://ef1p.com&quot; style=&quot;text-decoration: none; font-weight: bold; color: #0D4073;&quot;>\n      <img src=&quot;cid:logo@ef1p.com&quot; style=&quot;vertical-align: middle;&quot;> ef1p.com\n    </a>\n  </body>\n</html>\n\n--InnerBoundary--\n\n--UniqueBoundary\nContent-Type: image/png\nContent-ID: <logo@ef1p.com>\nContent-Transfer-Encoding: base64\nContent-Disposition: inline; filename=logo.png\n\niVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsSAAAL\nEgHS3X78AAAB4klEQVQ4y5VVwU7CQBDdKl5IVz8Fg95ZQH+BhBP/UEAxKv/AN3jG\n/1ATPeqlJr169WRpi/NmZ8uCEGqTl53OzrzO7MxOVdiKFB6s2gwDkeuEAeGRkBAW\ngkR02KvDFj4+hxMCpUq5T4h1d7LU3Zulbo+X5GQBGToC2XzC1vML1lmtPGMiciQ5\nI/xgBRmtBSFHpPS+0O0rRzzz/JWf5kxf3CKSQneusea8whGyjbIQ4kI+lMHHkTou\nTpMjA5kZpoQpoUnoEeJ1UiKzdiDKmdRG2ldeAWI+HxvZvfIeem9wihKhO09EKWuG\nD4KDC4WKITpJAUbnQnREugOR3+RjWVkgkMkR8AdtlAMQzj1C4ExIHNkh4XkbIaff\nYlJHOAdhos3IpbCN8IDw4hHmshZeoXLpjERJG7jNfYSpd9ZloUIj52mixT8IqdId\nrvYX4bXsxVVLlYRVUn46vryD0wPhRPSnrqVC+Hkp7ytKwFU2w29CKK1Wk70e0seN\n8otSpW0+CO9MZqIa9kSP5s85QssxqNrYLvrGxt7UXs/xqrGrXb2xmzqx6Jpik6IX\nJbq+8i90heGQs+zvwXZzOFQdX+7ess5EmZ2Nk7/ja/+AHXkDdiQDduLObPeA3fEL\nmMvYTwWJ6Hb+An4Bgrjq/fe5+zgAAAAASUVORK5CYII=\n\n--UniqueBoundary--" title="Set the body of the ESMTP tool to a multipart/related with content ID example.">`multipart/related` with content ID</a>
{:.compact}


### [Email tracking](/email/#remote-content)

<div id="tool-lookup-email-requests"></div>


### [POP3](/email/#post-office-protocol-version-3)

<div id="tool-protocol-pop3"></div>


### [IMAP](/email/#internet-message-access-protocol)

<div id="tool-protocol-imap"></div>


### [Sieve](/email/#mail-filtering-language)

<div id="tool-format-sieve"></div>


### [ManageSieve](/email/#filter-management-protocol)

<div id="tool-protocol-managesieve"></div>


## Encodings


### [Quoted-Printable encoding](/email/#content-encoding)

<div id="tool-encoding-quoted-printable"></div>


### [Base64 encoding](/email/#content-encoding)

<div id="tool-encoding-base64"></div>


### [Percent encoding](/email/#percent-encoding)

<div id="tool-encoding-percent"></div>


### [Encoded-Word encoding](/email/#header-encoding)

<div id="tool-encoding-encoded-word"></div>


### [Punycode encoding](/email/#punycode)

<div id="tool-encoding-punycode"></div>


### [Extended-Parameter encoding](/email/#internationalized-parameter-values)

<div id="tool-encoding-extended-parameter"></div>

**Examples:**
- <a class="bind-extended-parameter" href="#tool-encoding-extended-parameter" data-encoded="filename*=iso-8859-1'es'%A1Buenos%20d%EDas!.txt" title="Set the value of the Extended-Parameter tool to a filename example.">Filename</a>
- <a class="bind-extended-parameter" href="#tool-encoding-extended-parameter" data-encoded="name*0=&quot;Hello &quot;;\nname*1=world!" title="Set the value of the Extended-Parameter tool to a continuation example.">Continuation</a>
- <a class="bind-extended-parameter" href="#tool-encoding-extended-parameter" data-encoded="name*1=world!;\nname*0=&quot;Hello &quot;" title="Set the value of the Extended-Parameter tool to an ordering example.">Ordering</a>
- <a class="bind-extended-parameter" href="#tool-encoding-extended-parameter" data-encoded="name*2*=d%EDas!;\nname*0*=iso-8859-1'es'%A1;\nname*1=&quot;Buenos &quot;" title="Set the value of the Extended-Parameter tool to a combined example.">Combined</a>
{:.compact}


## Various


### [Hash function](/email/#secure-hash-algorithms)

<div id="tool-instruction-hashing"></div>


### [Unicode normalization](/email/#unicode-normalization)

<div id="tool-encoding-normalization"></div>


### [Unix time conversion](/email/#unix-time)

<div id="tool-conversion-unix-time"></div>
