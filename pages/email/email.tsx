import { Fragment } from 'react';

import { bind } from '../../code/utility/functions';
import { Time } from '../../code/utility/time';

import { CodeBlock, Comment, SystemReply, UserCommand } from '../../code/react/code';
import { ClickToCopy } from '../../code/react/copy';
import { StaticPrompt } from '../../code/react/prompt';
import { inject } from '../../code/react/utility';

import { toolConversionUnixTime } from '../../code/tools/conversions/unix-time';
import { toolEncodingBase64 } from '../../code/tools/encodings/base64';
import { toolEncodingEncodedWord } from '../../code/tools/encodings/encoded-word';
import { bindExtendedParameters, toolEncodingExtendedParameter } from '../../code/tools/encodings/extended-parameter';
import { bindUnicodeNormalizations, toolEncodingNormalization } from '../../code/tools/encodings/normalization';
import { toolEncodingPercent } from '../../code/tools/encodings/percent';
import { toolEncodingPunycode } from '../../code/tools/encodings/punycode';
import { toolEncodingQuotedPrintable } from '../../code/tools/encodings/quoted-printable';
import { toolFormatDkim } from '../../code/tools/formats/dkim';
import { toolFormatDmarc } from '../../code/tools/formats/dmarc';
import { toolFormatSieve } from '../../code/tools/formats/sieve';
import { toolInstructionHashing } from '../../code/tools/instructions/hashing';
import { toolInstructionThunderbird } from '../../code/tools/instructions/thunderbird';
import { toolInstructionTlsaRecord } from '../../code/tools/instructions/tlsa-record';
import { bindDnsQueries, toolLookupDnsRecords } from '../../code/tools/lookups/dns-records';
import { emailAddressOutput, toolLookupOpenpgpkeyRecords, toolLookupSmimeaRecords } from '../../code/tools/lookups/email-address';
import { bindSpfQuery, emailDkimSelectorOutput, emailDomainInput, emailDomainOutput, toolLookupBimiRecord, toolLookupConfigurationDatabase, toolLookupDkimRecord, toolLookupDmarcRecord, toolLookupMtaStsPolicy, toolLookupMxRecords, toolLookupSpfRecord, toolLookupSrvRecords, toolLookupTlsaRecords, toolLookupTlsReporting } from '../../code/tools/lookups/email-domain';
import { toolLookupEmailRequests } from '../../code/tools/lookups/email-requests';
import { toolLookupIpAddress } from '../../code/tools/lookups/ip-address';
import { bindEsmtpExamples, toolProtocolEsmtp, toolProtocolEsmtpClient } from '../../code/tools/protocols/esmtp';
import { toolProtocolImap } from '../../code/tools/protocols/imap';
import { openSslCommand, setOpenSslCommand, toolProtocolManageSieve, toolProtocolManageSieveOpenSsl } from '../../code/tools/protocols/managesieve';
import { toolProtocolPop3 } from '../../code/tools/protocols/pop3';

inject('tool-lookup-srv-records', toolLookupSrvRecords);
inject('tool-lookup-configuration-database', toolLookupConfigurationDatabase);
inject('tool-lookup-mx-records', toolLookupMxRecords);
inject('tool-protocol-esmtp', toolProtocolEsmtp);
inject('tool-lookup-dns-records', toolLookupDnsRecords);
inject('tool-reverse-dns', toolProtocolEsmtpClient);
inject('tool-instruction-hashing', toolInstructionHashing);
inject('tool-instruction-thunderbird', toolInstructionThunderbird);
inject('tool-protocol-pop3', toolProtocolPop3);
inject('tool-protocol-imap', toolProtocolImap);
inject('tool-format-sieve', toolFormatSieve);
inject('tool-protocol-managesieve', toolProtocolManageSieve);
inject('tool-encoding-quoted-printable', toolEncodingQuotedPrintable);
inject('tool-encoding-base64', toolEncodingBase64);
inject('tool-encoding-percent', toolEncodingPercent);
inject('tool-encoding-encoded-word', toolEncodingEncodedWord);
inject('tool-encoding-punycode', toolEncodingPunycode);
inject('tool-encoding-normalization', toolEncodingNormalization);
inject('tool-encoding-extended-parameter', toolEncodingExtendedParameter);
inject('tool-lookup-ip-address', toolLookupIpAddress);
inject('tool-lookup-email-requests', toolLookupEmailRequests);
inject('tool-lookup-spf-record', toolLookupSpfRecord);
inject('tool-format-dkim', toolFormatDkim);
inject('tool-lookup-dkim-record', toolLookupDkimRecord);
inject('tool-format-dmarc', toolFormatDmarc);
inject('tool-lookup-dmarc-record', toolLookupDmarcRecord);
inject('tool-lookup-bimi-record', toolLookupBimiRecord);
inject('tool-generate-keys', toolProtocolManageSieveOpenSsl);
inject('tool-conversion-unix-time', toolConversionUnixTime);
inject('tool-lookup-tlsa-records', toolLookupTlsaRecords);
inject('tool-instruction-tlsa-record', toolInstructionTlsaRecord);
inject('tool-verify-tlsa-record', toolProtocolManageSieveOpenSsl);
inject('tool-lookup-mta-sts-policy', toolLookupMtaStsPolicy);
inject('tool-lookup-tls-reporting', toolLookupTlsReporting);
inject('tool-lookup-smimea-records', toolLookupSmimeaRecords);
inject('tool-lookup-openpgpkey-records', toolLookupOpenpgpkeyRecords);

bindDnsQueries();
bindUnicodeNormalizations();
bindEsmtpExamples();
bindExtendedParameters();
bindSpfQuery();

inject('code-clipboard-verification', <CodeBlock>
    <Comment># macOS:</Comment>
    <StaticPrompt>watch -n 1 pbpaste</StaticPrompt>
    <br/>
    <Comment># Linux:</Comment>
    <StaticPrompt>watch -n 1 xclip -selection clipboard -o</StaticPrompt>
    <br/>
    <Comment># Windows:</Comment>
    <StaticPrompt>powershell -command "while (1) {'{'} Clear; Get-Clipboard; Sleep 1 {'}'}"</StaticPrompt>
</CodeBlock>);

inject('code-openssl-version', <CodeBlock>
    <StaticPrompt>openssl version</StaticPrompt>
    <SystemReply>LibreSSL 2.8.3</SystemReply>
</CodeBlock>);

inject('code-gmail-smtp-extensions', <CodeBlock>
    <StaticPrompt>openssl s_client -quiet -crlf -connect smtp.gmail.com:465</StaticPrompt>
    <SystemReply>depth=2 OU = GlobalSign Root CA - R2, O = GlobalSign, CN = GlobalSign</SystemReply>
    <SystemReply>verify return:1</SystemReply>
    <SystemReply>depth=1 C = US, O = Google Trust Services, CN = GTS CA 1O1</SystemReply>
    <SystemReply>verify return:1</SystemReply>
    <SystemReply>depth=0 C = US, ST = California, L = Mountain View, O = Google LLC, CN = smtp.gmail.com</SystemReply>
    <SystemReply>verify return:1</SystemReply>
    <SystemReply>220 smtp.gmail.com ESMTP [your session ID] - gsmtp</SystemReply>
    <UserCommand>EHLO localhost</UserCommand>
    <SystemReply>250-smtp.gmail.com at your service, [your IP address]</SystemReply>
    <SystemReply>250-SIZE 35882577</SystemReply>
    <SystemReply>250-8BITMIME</SystemReply>
    <SystemReply>250-AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH</SystemReply>
    <SystemReply>250-ENHANCEDSTATUSCODES</SystemReply>
    <SystemReply>250-PIPELINING</SystemReply>
    <SystemReply>250-CHUNKING</SystemReply>
    <SystemReply>250 SMTPUTF8</SystemReply>
    <UserCommand>QUIT</UserCommand>
    <SystemReply>221 2.0.0 closing connection [your session ID] - gsmtp</SystemReply>
    <SystemReply>read:errno=0</SystemReply>
</CodeBlock>);

inject('code-starttls-extension', <CodeBlock>
    <StaticPrompt>telnet smtp.gmail.com 587</StaticPrompt>
    <SystemReply>Trying 108.177.126.109...</SystemReply>
    <SystemReply>Connected to smtp.gmail.com.</SystemReply>
    <SystemReply>Escape character is '^]'.</SystemReply>
    <SystemReply>220 smtp.gmail.com ESMTP [your session ID] - gsmtp</SystemReply>
    <UserCommand>EHLO localhost</UserCommand>
    <SystemReply>250-smtp.gmail.com at your service, [your IP address]</SystemReply>
    <SystemReply>250-SIZE 35882577</SystemReply>
    <SystemReply>250-8BITMIME</SystemReply>
    <SystemReply>250-STARTTLS</SystemReply>
    <SystemReply>250-ENHANCEDSTATUSCODES</SystemReply>
    <SystemReply>250-PIPELINING</SystemReply>
    <SystemReply>250-CHUNKING</SystemReply>
    <SystemReply>250 SMTPUTF8</SystemReply>
    <UserCommand>QUIT</UserCommand>
    <SystemReply>221 2.0.0 closing connection [your session ID] - gsmtp</SystemReply>
    <SystemReply>Connection closed by foreign host.</SystemReply>
</CodeBlock>);

inject('code-starttls-usage', <CodeBlock>
    <StaticPrompt>openssl s_client -quiet -crlf -starttls smtp -connect smtp.gmail.com:587</StaticPrompt>
</CodeBlock>);

inject('code-gandi-vrfy-command', <CodeBlock>
    <StaticPrompt>openssl s_client -quiet -crlf -starttls smtp -connect spool.mail.gandi.net:25</StaticPrompt>
    <SystemReply>[…]</SystemReply>
    <UserCommand>VRFY kaspar@ef1p.com</UserCommand>
    <SystemReply>502 5.5.1 VRFY command is disabled</SystemReply>
</CodeBlock>);

inject('code-gmail-help-command', <CodeBlock>
    <StaticPrompt>openssl s_client -quiet -crlf -starttls smtp -connect gmail-smtp-in.l.google.com:25</StaticPrompt>
    <SystemReply>[…]</SystemReply>
    <UserCommand>HELP</UserCommand>
    <SystemReply>214 2.0.0  https://www.google.com/search?btnI&q=RFC+5321 [your session ID] - gsmtp</SystemReply>
</CodeBlock>);

inject('code-gandi-pop3-extensions', <CodeBlock>
    <StaticPrompt>telnet mail.gandi.net 110</StaticPrompt>
    <SystemReply>Trying 217.70.178.9...</SystemReply>
    <SystemReply>Connected to mail.gandi.net.</SystemReply>
    <SystemReply>Escape character is '^]'.</SystemReply>
    <SystemReply>+OK Dovecot ready.</SystemReply>
    <UserCommand>CAPA</UserCommand>
    <SystemReply>+OK</SystemReply>
    <SystemReply>CAPA</SystemReply>
    <SystemReply>TOP</SystemReply>
    <SystemReply>UIDL</SystemReply>
    <SystemReply>RESP-CODES</SystemReply>
    <SystemReply>PIPELINING</SystemReply>
    <SystemReply>AUTH-RESP-CODE</SystemReply>
    <SystemReply>STLS</SystemReply>
    <SystemReply>USER</SystemReply>
    <SystemReply>SASL PLAIN</SystemReply>
    <SystemReply>.</SystemReply>
    <UserCommand>QUIT</UserCommand>
    <SystemReply>+OK Logging out</SystemReply>
    <SystemReply>Connection closed by foreign host.</SystemReply>
</CodeBlock>);

inject('code-imap-unquoted-string', <CodeBlock>
    <UserCommand>E EXAMINE INBOX</UserCommand>
</CodeBlock>);

inject('code-imap-quoted-string', <CodeBlock>
    <UserCommand>E EXAMINE "Sent Mail"</UserCommand>
</CodeBlock>);

inject('code-imap-prefixed-string', <CodeBlock>
    <UserCommand>F FETCH 1 (BODY.PEEK[HEADER.FIELDS (SUBJECT)])</UserCommand>
    <SystemReply>
        * 1 FETCH (BODY[HEADER.FIELDS (SUBJECT)] {'{20}'}<br/>
        Subject: Question<br/><br/>)<br/>
        F OK FETCH completed
    </SystemReply>
</CodeBlock>);

inject('code-imap-nested-list', <CodeBlock>
    <UserCommand>F FETCH 1 (FLAGS)</UserCommand>
    <SystemReply>
        * 1 FETCH (FLAGS (\Seen))<br/>
        F OK FETCH completed
    </SystemReply>
</CodeBlock>);

inject('code-imap-empty-list', <CodeBlock>
    <UserCommand>F FETCH 1 (FLAGS)</UserCommand>
    <SystemReply>
        * 1 FETCH (FLAGS ())<br/>
        F OK FETCH completed
    </SystemReply>
</CodeBlock>);

inject('code-imap-custom-flag', <CodeBlock>
    <UserCommand>S STORE 1 +FLAGS (custom-flag)</UserCommand>
    <SystemReply>
        * FLAGS (\Answered \Flagged \Deleted \Seen \Draft custom-flag)<br/>
        * OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft custom-flag \*)]<br/>
        * 1 FETCH (FLAGS (\Seen custom-flag))<br/>
        S OK STORE completed
    </SystemReply>
</CodeBlock>);

inject('code-imap-internal-date', <CodeBlock>
    <UserCommand>F FETCH 1 (INTERNALDATE)</UserCommand>
    <SystemReply>
        * 1 FETCH (INTERNALDATE "24-Nov-2020 15:43:32 +0000")<br/>
        F OK FETCH completed
    </SystemReply>
</CodeBlock>);

const today = new Date();
const tomorrow = new Date();
const tomorrowInAWeek = new Date();
tomorrow.setDate(today.getDate() + 1);
tomorrowInAWeek.setDate(today.getDate() + 8);

inject('code-vacation-response', <CodeBlock>
    <ClickToCopy>
        require ["date", "relational", "vacation"];<br/>
        if allof (currentdate :value "ge" "date" "{Time.fromDate(tomorrow).toLocalTime().toGregorianDate()}", currentdate :value "le" "date" "{Time.fromDate(tomorrowInAWeek).toLocalTime().toGregorianDate()}") {'{'}<br/>
        {'    '}vacation "Hi, I had to take a couple of days off to read ef1p.com/email. I should be back soon.";<br/>
        {'}'}
    </ClickToCopy>
</CodeBlock>);

inject('code-brew-version', <CodeBlock>
    <StaticPrompt>brew --version</StaticPrompt>
</CodeBlock>);

inject('code-install-brew', <CodeBlock>
    <StaticPrompt>/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"</StaticPrompt>
</CodeBlock>);

inject('code-install-openssl', <CodeBlock>
    <StaticPrompt>brew install openssl</StaticPrompt>
</CodeBlock>);

inject('code-installed-openssl', <CodeBlock>
    <StaticPrompt>/usr/local/opt/openssl/bin/openssl version</StaticPrompt>
</CodeBlock>);

bind('set-openssl-command', 'click', () => setOpenSslCommand('/usr/local/opt/openssl/bin/openssl'));

inject('code-message-decompression', <CodeBlock>
    <StaticPrompt>echo -n "eNoLycgsVgCi4vzcVIXixNyCnFSF5Py8ktS8Ej0AlCkKVA==" | openssl base64 -d -A | pigz -d</StaticPrompt>
    <SystemReply>This is some sample content.</SystemReply>
</CodeBlock>);

inject('code-encoding-with-qprint', <CodeBlock>
    <StaticPrompt noNewline>qprint -e</StaticPrompt>
    <StaticPrompt noNewline>qprint -d</StaticPrompt>
</CodeBlock>);

inject('code-encoding-with-node', <CodeBlock>
    <Comment># You have to install the package only once:</Comment>
    <StaticPrompt noNewline>npm install -g quoted-printable</StaticPrompt>
    <StaticPrompt noNewline>quoted-printable -e</StaticPrompt>
    <StaticPrompt noNewline>quoted-printable -d</StaticPrompt>
</CodeBlock>);

inject('code-encoding-with-openssl', <CodeBlock>
    <StaticPrompt noNewline>openssl base64 -e</StaticPrompt>
    <StaticPrompt noNewline>openssl base64 -d</StaticPrompt>
</CodeBlock>);

inject('code-encoding-with-perl', <CodeBlock>
    <StaticPrompt noNewline>perl -MMIME::QuotedPrint -0777 -nle 'print encode_qp($_)'</StaticPrompt>
    <StaticPrompt noNewline>perl -MMIME::QuotedPrint -0777 -nle 'print decode_qp($_)'</StaticPrompt>
    <br/>
    <StaticPrompt noNewline>perl -MMIME::Base64 -0777 -ne 'print encode_base64($_)'</StaticPrompt>
    <StaticPrompt noNewline>perl -MMIME::Base64 -0777 -ne 'print decode_base64($_)'</StaticPrompt>
    <br/>
    <StaticPrompt noNewline>perl -MURI::Escape -0777 -ne 'print uri_escape($_)'</StaticPrompt>
    <StaticPrompt noNewline>perl -MURI::Escape -0777 -ne 'print uri_unescape($_)'</StaticPrompt>
</CodeBlock>);

inject('code-encoding-with-python', <CodeBlock>
    <StaticPrompt noNewline>python3 -c 'import sys, quopri; sys.stdout.buffer.write(quopri.encodestring(sys.stdin.buffer.read()))'</StaticPrompt>
    <StaticPrompt noNewline>python3 -c 'import sys, quopri; sys.stdout.buffer.write(quopri.decodestring(sys.stdin.buffer.read()))'</StaticPrompt>
    <br/>
    <StaticPrompt noNewline>python3 -c 'import sys, base64; sys.stdout.buffer.write(base64.b64encode(sys.stdin.buffer.read()))'</StaticPrompt>
    <StaticPrompt noNewline>python3 -c 'import sys, base64; sys.stdout.buffer.write(base64.b64decode(sys.stdin.buffer.read()))'</StaticPrompt>
    <br/>
    <StaticPrompt noNewline>python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read()))'</StaticPrompt>
    <StaticPrompt noNewline>python3 -c 'import sys, urllib.parse; print(urllib.parse.unquote(sys.stdin.read()))'</StaticPrompt>
</CodeBlock>);

inject('code-whois-queries', <CodeBlock>
    <StaticPrompt>telnet whois.iana.org 43</StaticPrompt>
    <UserCommand>com</UserCommand>
    <SystemReply>[…]</SystemReply>
    <SystemReply>whois: whois.verisign-grs.com</SystemReply>
    <SystemReply>[…]</SystemReply>
    <SystemReply>Connection closed by foreign host.</SystemReply>
    <StaticPrompt>telnet whois.verisign-grs.com 43</StaticPrompt>
    <UserCommand>ef1p.com</UserCommand>
    <SystemReply>[…]</SystemReply>
    <SystemReply>Registrar WHOIS Server: whois.gandi.net</SystemReply>
    <SystemReply>[…]</SystemReply>
    <SystemReply>Connection closed by foreign host.</SystemReply>
    <StaticPrompt>telnet whois.gandi.net 43</StaticPrompt>
    <UserCommand>ef1p.com</UserCommand>
    <SystemReply>[…]</SystemReply>
    <SystemReply>Registrant Name: REDACTED FOR PRIVACY</SystemReply>
    <SystemReply>[…]</SystemReply>
    <SystemReply>Connection closed by foreign host.</SystemReply>
</CodeBlock>);

inject('code-opt-pseudosection', <CodeBlock>
    <StaticPrompt>dig ef1p.com +dnssec</StaticPrompt>
    <SystemReply>[…]</SystemReply>
    <SystemReply>;; OPT PSEUDOSECTION:</SystemReply>
    <SystemReply>; EDNS: version: 0, flags: do; udp: 4096</SystemReply>
    <SystemReply>[…]</SystemReply>
</CodeBlock>);

inject('code-generate-keys', <CodeBlock>
    <Comment># Generate RSA key (OpenSSL and LibreSSL):</Comment>
    <StaticPrompt>{openSslCommand} genrsa -out private.pem 2048</StaticPrompt>
    <StaticPrompt>{openSslCommand} rsa -in private.pem -pubout -out public.pem</StaticPrompt>
    <br/>
    <Comment># Generate shorter ED25519 key (only OpenSSL):</Comment>
    <StaticPrompt>{openSslCommand} genpkey -algorithm ED25519 -out private.pem</StaticPrompt>
    <StaticPrompt>{openSslCommand} pkey -in private.pem -pubout -out public.pem</StaticPrompt>
    <br/>
    <Comment># Output the public key:</Comment>
    <StaticPrompt>cat public.pem</StaticPrompt>
    <SystemReply>-----BEGIN PUBLIC KEY-----</SystemReply>
    <SystemReply>[Base64-encoded public key]</SystemReply>
    <SystemReply>-----END PUBLIC KEY-----</SystemReply>
</CodeBlock>);

inject('code-query-records', <Fragment>
    {emailDomainInput}
    <CodeBlock>
        <Comment># SPF:</Comment>
        <StaticPrompt>dig {emailDomainOutput} txt +short</StaticPrompt>
        <br/>
        <Comment># DKIM:</Comment>
        <StaticPrompt>dig {emailDkimSelectorOutput}._domainkey.{emailDomainOutput} txt +short</StaticPrompt>
        <br/>
        <Comment># DMARC:</Comment>
        <StaticPrompt>dig _dmarc.{emailDomainOutput} txt +short</StaticPrompt>
    </CodeBlock>
</Fragment>);

inject('code-verify-tlsa-record', <CodeBlock>
    <StaticPrompt>{openSslCommand} s_client -starttls smtp -connect mail.protonmail.ch:25 -verify_return_error -dane_tlsa_domain "mail.protonmail.ch" -dane_tlsa_rrdata "3 1 1 6111a5698d23c89e09c36ff833c1487edc1b0c841f87c49dae8f7a09e11e979e" -dane_tlsa_rrdata "3 1 1 76bb66711da416433ca890a5b2e5a0533c6006478f7d10a4469a947acc8399e1"</StaticPrompt>
    <SystemReply>[…]</SystemReply>
    <SystemReply>---</SystemReply>
    <SystemReply>SSL handshake has read 5166 bytes and written 433 bytes</SystemReply>
    <SystemReply>Verification: OK</SystemReply>
    <SystemReply>Verified peername: *.protonmail.ch</SystemReply>
    <SystemReply>DANE TLSA 3 1 1 ...8f7d10a4469a947acc8399e1 matched EE certificate at depth 0</SystemReply>
    <SystemReply>---</SystemReply>
    <SystemReply>[…]</SystemReply>
</CodeBlock>);

inject('code-verify-tlsa-record-yourself', <CodeBlock>
    <StaticPrompt>echo 'QUIT' | openssl s_client -starttls smtp -connect mail.protonmail.ch:25 2&gt; /dev/null | openssl x509 -noout -pubkey | openssl pkey -pubin -outform DER | openssl sha256</StaticPrompt>
    <SystemReply>76bb66711da416433ca890a5b2e5a0533c6006478f7d10a4469a947acc8399e1</SystemReply>
</CodeBlock>);

inject('code-gpg-key-export', <CodeBlock>
    <Comment># Export the public key of the given user in the OPENPGPKEY presentation format:</Comment>
    <StaticPrompt>gpg --export --export-options export-minimal,no-export-attributes {emailAddressOutput} | base64</StaticPrompt>
    <br/>
    <Comment># Export the public key of the given user in the generic record syntax of RFC 3597:</Comment>
    <StaticPrompt>gpg --export --export-options export-minimal,no-export-attributes,export-dane {emailAddressOutput}</StaticPrompt>
</CodeBlock>);

inject('code-ssh-config', <CodeBlock>
    <StaticPrompt>mkdir -p ~/.ssh</StaticPrompt>
    <StaticPrompt>chmod 700 ~/.ssh</StaticPrompt>
    <StaticPrompt>touch ~/.ssh/config</StaticPrompt>
    <StaticPrompt>chmod 600 ~/.ssh/config</StaticPrompt>
</CodeBlock>);
