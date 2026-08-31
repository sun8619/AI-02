# v93 Verification of the v92 Review

Release: `v93-20260831`. Date: 2026-08-31.

## What Was Reproduced and Fixed

1. **Unrelated speech/text was treated as mathematics failure.** Reproduced typed "今天天气很好" entering remediation. The cause was two different routes: voice used length/keyword guesses and a blacklist, while the math evaluator admitted short unrelated sentences. Both now use the shared answer-shape contract before grading. Chatter/partial replies redirect to the same question, preserving help, remediation, mastery, previous valid reply and error evidence. Valid wrong numbers/units/choices still receive teaching. Help and course-switch intentions are bounded so "我不会游泳" and "我的下一个生日" cannot trigger them.
2. **Thirteen choices lacked candidate diagrams.** Six angle and seven observation items now have authored visual models and source-driven A/B/C drawings in both question and help states. Angle help overlays a right-angle baseline. Observation uses one box-shaped toy house with a front door and internally consistent front, side and top projections. Prompts no longer name the direction the child is supposed to infer. Model facts are stored separately from answer keys and independently checked.
3. **Help needed more than changed text.** Clock help now marks ticks, the minute sweep and the relevant hand. Data totals lay out category quantities to combine; row lookups retain the original table. Ruler help distinguishes looking up the starting mark from counting length intervals. Arrangement help fixes a tens digit and shows the available ones digits. The renderer never borrows an unrelated question's figures.
4. **Short learning time looked lost.** Seconds are retained and summed before display: ten 20-second sessions show `3分20秒`; shorter totals show seconds. Chatter-only visits do not create failed learning records. Existing delayed timelines/ratios were retained and delayed pass percentage now includes its denominator and a no-evidence state. Voice adoption remains explicitly different from acoustic recognition accuracy.
5. **Small picker labels and compact-screen clipping.** Unit and auxiliary picker text is at least 14px, topic text 16px, with wrapping. Real screenshots found a second problem: candidate figures were below an inner scroll boundary despite the page itself not overflowing. Phone choice layout and bounded diagram sizes now keep all three candidate figures and labels visible. On narrow phones the keyboard command uses its familiar icon with an accessible name; the speech replay action no longer consumes a whole header row.

## Report Findings That Needed Qualification

- The reported 54 missing hints were not all reproducible with the actual page payload. The runtime retains source clock/table/ruler context: 643 of 668 current steps have a meaningful hint contract, with 25 no-op entries hidden. The remaining 25 are judgement statements. This is not claimed to be 100% pedagogical quality; the real-browser audit checks computed changes as well as markup.
- Cross-day timelines, delayed counts and help/voice ratios already existed in v92. We did not replace them with an invented mastery curve.
- A single numeric answer cannot always be declared wrong for a multi-part task: a missing second field is incomplete. The old all-question wrong-answer test used `99999` even for multiple blanks; it now mutates a complete answer or selects a real wrong option. Separate tests protect incomplete responses from failure evidence.

## Automated Verification

- 42 knowledge points, 462 source questions and 668 microsteps remain reachable.
- 21 product regression groups: source answers advance, valid complete errors teach, guided repairs remain bounded, help is excluded from independent mastery, ASR never corrects a number using the expected answer.
- 56 unrelated/partial utterances against 2,054 active contracts (whole, assessment, guided and remediation): 115,024 classifications in each of the keyboard/shared and voice routes.
- 24,648 live-router calls verify that non-answers preserve learning state; correct and well-formed wrong inputs remain covered separately.
- 26 choice questions, 252 label/text/combined-answer routes; all 13 new visual models independently checked against geometry/view facts.
- Browser: existing 84 option clicks, all 668 step pictures and 70 responsive states; new 182 choice visual states across seven viewport sizes, 28 picker states, and 16 real typed non-answer submissions in four learning phases.
- Narrowest view 320x568; largest 1920x1080; portrait/landscape phones and tablets included. Candidate image/label containment is explicitly asserted, not inferred from page overflow alone.
- Speech lifecycle: stale synthesis, interruption, deadlines, rate limiting, autoplay recovery, repeated help and background cleanup.
- Source audit independently recomputes 128 numeric/comparison/conversion answers. Thirteen new authored angle/view facts are additionally checked. Other semantic answers still require teacher review.
- Release manifest verifies 51 files. Deployment fixtures cover success, download/preflight/restart failure and stale-health rollback with protected configuration/data preserved. One local fixture run hit the old 15-second harness timeout under simultaneous heavy tests; isolated rerun passed, and the harness now allows 60 seconds and reports timeouts explicitly.

## Release Evidence

- Code commit: `3cfeea9e41077814d03a101e61051d0a29ca6191` on `sun8619/AI-02`.
- Downloaded the pinned GitHub archive separately; verified all 51 manifest files, installed production-only dependencies and passed `npm test` from that fresh archive.
- Independent Ubuntu/Node 20 pipeline: [Child learning regression](https://github.com/sun8619/AI-02/actions/runs/33360464318). Its live result is the source of truth for CI status.
- The pinned, backup-and-rollback server command is in `docs/v93-server-update.md`. Publishing to GitHub does not update the running production server.

## Remaining Manual Gates

This release is not a claim that every utterance is understood, speech recognition is solved, or the product is commercially mature. Real children, actual iOS/Android/WeChat microphone and autoplay behavior, weak-network interruptions, professional teaching review, and delayed retention need the manual acceptance checklist in `docs/v92-manual-acceptance.md`. Local tests do not deploy the live server or certify the live speech provider's configuration.
