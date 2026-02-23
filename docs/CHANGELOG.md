<a id="1.0.0"></a>
# [1.0.0](https://github.com/Bedrock-im/bedrock/releases/tag/1.0.0) - 2026-02-23

## Bedrock 1.0

This release includes all the features planned in our initial roadmap in 2024, making it a first stable version of Bedrock.

## 🚀 Features

<details>
<summary>36 changes</summary>

- Feat/rename folder by @Croos3r (#140)
- feat: Public sharing by @EdenComp (#130)
- Feat: add visualization by @chuipagro (#128)
- feat(back): Working topup credits by @RezaRahemtola (#114)
- feat(sharing): Use usernames to create contacts by @RezaRahemtola (#112)
- Feat: Knowledge base chats by @Croos3r (#107)
- fix(login): External providers login by @RezaRahemtola (#111)
- Credits top up by @RezaRahemtola (#106)
- Username avatar display by @RezaRahemtola (#99)
- fix: remove prompts from contacts page and update storybook by @EdenComp (#97)
- Usernames fixes \& backend deployment by @RezaRahemtola (#94)
- Feat: Knowledge Bases CRUD by @Croos3r (#92)
- feat: Sharing frontend by @EdenComp (#88)
- Usernames by @RezaRahemtola (#91)
- feat: Thirdweb migration as auth provider by @RezaRahemtola (#85)
- Sharing functions by @RezaRahemtola (#81)
- ci(front): Deploy previews on Aleph by @RezaRahemtola (#80)
- FEAT: add trash page by @chuipagro (#71)
- Contacts setup by @RezaRahemtola (#76)
- feat: Table component and UI overhaul by @EdenComp (#74)
- Setup files handling for sharing and trash by @RezaRahemtola (#73)
- feat/add-basic-tests by @chuipagro (#168)
- feat: Comprehensive WCAG 2.1 AA Accessibility Improvements by @Croos3r (#169)
- feat: Support PDF in knowledge bases by @RezaRahemtola (#167)
- feat: Docker deployment by @RezaRahemtola (#163)
- feat: Sharing details and revoke by @RezaRahemtola (#151)
- feat: Skeletons and loading buttons by @EdenComp (#143)
- feat: Move/Copy UI refactor \& small UI improvements by @EdenComp (#138)
- feat: edition by @chuipagro (#137)
- feat: UI Improvements by @EdenComp (#134)
- feat: Move logic to external SDK by @RezaRahemtola (#131)
- Move and rename folders by @Croos3r (#121)
- add bulk for delete and download by @chuipagro (#120)
- add duplicate files and copy paste by @chuipagro (#117)
- feat: Bulk actions frontend by @EdenComp (#116)
</details>

## 🐛 Bug Fixes

<details>
<summary>29 changes</summary>

- fix: Multiple UI fixes by @RezaRahemtola (#161)
- Fix bulk copy not including folders and folder creation error by @Croos3r (#162)
- fix(drive-folder-copy): copying folder is now recursive by @Croos3r (#160)
- feat/select on simple left click by @Croos3r (#159)
- fix(drive-code-preview): removed slate background for default and integrated one by @Croos3r (#158)
- fix/folder copy by @Croos3r (#156)
- fix(bulk-copy): Single call by @RezaRahemtola (#157)
- fix: open files selection on kb creation by @EdenComp (#155)
- fix: duplicate name by @chuipagro (#147)
- Fix/upload in folder by @chuipagro (#141)
- Fix: hidden files with spaces in the name/path by @Croos3r (#126)
- fix: sonner by @EdenComp (#108)
- fix: ai chat markdown by @EdenComp (#166)
- fix(drive-edition): pptx are now not showing edit button by @Croos3r (#165)
- fix(bulk-move): Make a single SDK call for bulk move by @RezaRahemtola (#154)
- fix: bulk delete operations in trash by @EdenComp (#152)
- fix(drive-folder-creation): file create modal input state was remembered across opens by @Croos3r (#150)
- fix: copy name by @chuipagro (#149)
- fix: Small UI improvements by @EdenComp (#144)
- fix: Actions updating state only after by @RezaRahemtola (#142)
- fix(drive): fix selection checkbox not toggling on when clicked or when every items are selected by @Croos3r (#139)
- fix: unable to fetch files if some contacts exists by @EdenComp (#133)
- fix: Contacts popup by @EdenComp (#129)
- fix: search engine optimizations by @EdenComp (#119)
- Last fixes for hard and soft deletes on folders and files by @Croos3r (#118)
- fix: UI prompts by @EdenComp (#115)
- fix(sharing): Working sharing behavior and local signature storage by @RezaRahemtola (#96)
- FIX: ui conflict by @chuipagro (#93)
- Fix: add null shared Keys when calling save function by @chuipagro (#87)
</details>

## 🧰 Maintenance

<details>
<summary>15 changes</summary>

- chore(deps): bump cryptography from 45.0.5 to 46.0.5 in /back in the pip group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#171)
- chore(deps): bump hono from 4.11.5 to 4.11.7 in the npm\_and\_yarn group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#148)
- chore(deps): bump python-multipart from 0.0.20 to 0.0.22 in /back in the pip group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#145)
- chore(deps): bump the pip group across 1 directory with 2 updates by @[dependabot[bot]](https://github.com/apps/dependabot) (#136)
- chore(deps): bump the npm\_and\_yarn group across 2 directories with 1 update by @[dependabot[bot]](https://github.com/apps/dependabot) (#135)
- chore(deps): bump urllib3 from 2.5.0 to 2.6.0 in /back in the pip group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#132)
- chore(deps): bump starlette from 0.47.2 to 0.49.1 in /back in the pip group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#127)
- chore(deps): bump starlette from 0.47.1 to 0.47.2 in /back in the pip group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#122)
- chore(deps): bump aiohttp from 3.12.4 to 3.12.14 in /back in the pip group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#110)
- chore(deps): bump urllib3 from 2.4.0 to 2.5.0 in /back in the pip group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#105)
- chore(deps): bump requests from 2.32.3 to 2.32.4 in /back in the pip group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#102)
- chore(deps): bump elliptic from 6.6.0 to 6.6.1 in the npm\_and\_yarn group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#89)
- chore(deps): bump the npm\_and\_yarn group across 1 directory with 2 updates by @[dependabot[bot]](https://github.com/apps/dependabot) (#86)
- chore(deps): bump the npm\_and\_yarn group across 2 directories with 5 updates by @[dependabot[bot]](https://github.com/apps/dependabot) (#84)
- chore(deps): bump image-size from 1.1.1 to 1.2.1 in the npm\_and\_yarn group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) (#82)
</details>

## 📄 Documentation

- Update introduction.md by @chuipagro (#113)
- docs: Test policy by @RezaRahemtola (#170)
- docs(epitech): KPI report and BTP by @RezaRahemtola (#109)
- improve readme.md by @chuipagro (#103)
- feat(epitech): Beta test plan by @RezaRahemtola (#83)


[Changes][1.0.0]


<a id="0.1.3"></a>
# [0.1.3](https://github.com/Bedrock-im/bedrock/releases/tag/0.1.3) - 2025-02-20

## Drive features

This release includes the features you would expect from a drive, like file actions, folders...
It also includes various security updates and small bug fixes

## 🚀 Features

- Soft removal and restore of files by [@Croos3r](https://github.com/Croos3r) ([#70](https://github.com/Bedrock-im/bedrock/issues/70))
- feat(folder-and-file-actions): fully working actions by [@Croos3r](https://github.com/Croos3r) ([#67](https://github.com/Bedrock-im/bedrock/issues/67))
- fix: File table UI and context menu by [@EdenComp](https://github.com/EdenComp) ([#66](https://github.com/Bedrock-im/bedrock/issues/66))
- Feat: add Download by [@chuipagro](https://github.com/chuipagro) ([#64](https://github.com/Bedrock-im/bedrock/issues/64))

## 🐛 Bug Fixes

- fix: Authentication issues by [@EdenComp](https://github.com/EdenComp) ([#65](https://github.com/Bedrock-im/bedrock/issues/65))
- fix: File upload working by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#62](https://github.com/Bedrock-im/bedrock/issues/62))

## 🧰 Maintenance

- chore(deps): bump the npm\_and\_yarn group across 2 directories with 1 update by @[dependabot[bot]](https://github.com/apps/dependabot) ([#69](https://github.com/Bedrock-im/bedrock/issues/69))
- chore(deps): bump the npm\_and\_yarn group across 2 directories with 3 updates by @[dependabot[bot]](https://github.com/apps/dependabot) ([#63](https://github.com/Bedrock-im/bedrock/issues/63))
- chore(deps): bump nanoid from 3.3.7 to 3.3.8 in the npm\_and\_yarn group across 1 directory by @[dependabot[bot]](https://github.com/apps/dependabot) ([#61](https://github.com/Bedrock-im/bedrock/issues/61))

## 📄 Documentation

- Update changelog for 0.1.2 by @[github-actions[bot]](https://github.com/apps/github-actions) ([#60](https://github.com/Bedrock-im/bedrock/issues/60))


[Changes][0.1.3]


<a id="0.1.2"></a>
# [0.1.2](https://github.com/Bedrock-im/bedrock/releases/tag/0.1.2) - 2024-11-08

## Basic drive interface

Basic interface to interact with the drive.

## 🚀 Features

- Feat: setup drive interface by [@chuipagro](https://github.com/chuipagro) ([#55](https://github.com/Bedrock-im/bedrock/issues/55))

## 📄 Documentation

- Update changelog for 0.1.1 by [@github-actions](https://github.com/github-actions) ([#59](https://github.com/Bedrock-im/bedrock/issues/59))


[Changes][0.1.2]


<a id="0.1.1"></a>
# [0.1.1](https://github.com/Bedrock-im/bedrock/releases/tag/0.1.1) - 2024-11-08

## File upload

General enhancements with basic features, code hierarchy improvements and final design system components

## 🚀 Features

- Feat: Made current drive directory available across the app using a store by [@Croos3r](https://github.com/Croos3r) ([#58](https://github.com/Bedrock-im/bedrock/issues/58))
- feat: File upload by [@Croos3r](https://github.com/Croos3r) ([#54](https://github.com/Bedrock-im/bedrock/issues/54))
- feat: Design System - Components Part III by [@EdenComp](https://github.com/EdenComp) ([#49](https://github.com/Bedrock-im/bedrock/issues/49))

## 🐛 Bug Fixes

- Feat: Made current drive directory available across the app using a store by [@Croos3r](https://github.com/Croos3r) ([#58](https://github.com/Bedrock-im/bedrock/issues/58))

[Changes][0.1.1]


<a id="0.1.0"></a>
# [0.1.0](https://github.com/Bedrock-im/bedrock/releases/tag/0.1.0) - 2024-11-03

## Basic setup

First release with the backbone setup of Bedrock.im, including the UI with a custom design system and Aleph accounts creation, documentation and automated tests.

## 🚀 Features

- feat: Design system components Part II by [@EdenComp](https://github.com/EdenComp) ([#35](https://github.com/Bedrock-im/bedrock/issues/35))
- Aleph service by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#33](https://github.com/Bedrock-im/bedrock/issues/33))
- ci: Release drafter by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#40](https://github.com/Bedrock-im/bedrock/issues/40))
- Create LICENSE by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#36](https://github.com/Bedrock-im/bedrock/issues/36))
- Netlify setup by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#32](https://github.com/Bedrock-im/bedrock/issues/32))
- feat(front): Add build directory by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#31](https://github.com/Bedrock-im/bedrock/issues/31))
- Auth with Privy, navbar and sidebar by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#26](https://github.com/Bedrock-im/bedrock/issues/26))
- feat: Design System components 1 by [@EdenComp](https://github.com/EdenComp) ([#27](https://github.com/Bedrock-im/bedrock/issues/27))
- feat: Storybook and Button component by [@EdenComp](https://github.com/EdenComp) ([#23](https://github.com/Bedrock-im/bedrock/issues/23))
- feat(front): Basic setup by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#12](https://github.com/Bedrock-im/bedrock/issues/12))

## 🧰 Maintenance

- chore: Yarn monorepo setup by [@EdenComp](https://github.com/EdenComp) ([#46](https://github.com/Bedrock-im/bedrock/issues/46))

## 📄 Documentation

- Documentation setup \& related CI changes by [@RezaRahemtola](https://github.com/RezaRahemtola) ([#50](https://github.com/Bedrock-im/bedrock/issues/50))


[Changes][0.1.0]


[1.0.0]: https://github.com/Bedrock-im/bedrock/compare/0.1.3...1.0.0
[0.1.3]: https://github.com/Bedrock-im/bedrock/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/Bedrock-im/bedrock/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/Bedrock-im/bedrock/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/Bedrock-im/bedrock/tree/0.1.0

<!-- Generated by https://github.com/rhysd/changelog-from-release v3.9.1 -->
