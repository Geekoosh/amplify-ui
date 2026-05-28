<img src="./docs/public/amplify-logo.svg" alt="AWS Amplify Logo" style="width:2vw"> AWS Amplify

---

<p align="center">
  <img src="docs/public/svg/favicon.svg" style="width:12vw" alt="Amplify UI logo" />
  <h1 align="center">Amplify UI</h1>
</p>

[![GitHub](https://img.shields.io/github/license/saasontools/amplify-ui)](LICENSE)
[![Discord](https://img.shields.io/discord/308323056592486420?logo=discord)](https://discord.gg/jWVbPfC)
[![Open Bugs](https://img.shields.io/github/issues/saasontools/amplify-ui/bug?color=d73a4a&label=bugs)](https://github.com/saasontools/amplify-ui/issues?q=is%3Aissue+is%3Aopen+label%3Abug)
[![Feature Requests](https://img.shields.io/github/issues/saasontools/amplify-ui/feature-request?color=ff9001&label=feature%20requests)](https://github.com/saasontools/amplify-ui/issues?q=is%3Aissue+label%3Afeature-request+is%3Aopen)

Amplify UI is an open-source UI library with cloud-connected components that are endlessly customizable, accessible, and can integrate into _any_ application. Amplify UI consists of:

1. Connected components that simplify complex cloud-connected workflows, like Authenticator.
2. Primitive components that create consistency across Amplify UI and allow you to build complete applications that fit your brand, like Buttons and Badges.
3. Data-bound components that make it easy to display dynamic data, like DataStoreCollections.
4. Theming capabilities that allow you to customize the appearance of Amplify UI to match your brand.

This SaaSOn fork publishes exactly three internal packages to GitHub Packages:

| Package Name                         | Registry                     | Visibility |
| ------------------------------------ | ---------------------------- | ---------- |
| `@saasontools/amplify-ui`            | `https://npm.pkg.github.com` | Internal   |
| `@saasontools/amplify-ui-react`      | `https://npm.pkg.github.com` | Internal   |
| `@saasontools/amplify-ui-react-core` | `https://npm.pkg.github.com` | Internal   |

## Documentation

- https://ui.docs.amplify.aws/

## Getting started

- https://ui.docs.amplify.aws/getting-started/installation

## Component Matrix

| **Connected Components** | **React** | **React Native** | **Angular** | **Vue** |
| :----------------------- | :-------: | :--------------: | :---------: | :-----: |
| Authenticator            |    ✅     |        ✅        |     ✅      |   ✅    |
| InAppMessagingDisplay    |    ✅     |        ✅        |             |         |
| MapView/LocationSearch   |    ✅     |                  |             |         |
| Account Settings         |    ✅     |                  |             |         |
| StorageBrowser           |    ✅     |                  |             |         |
| FileUploader             |    ✅     |                  |             |         |
| StorageImage             |    ✅     |                  |             |         |
| FaceLivenessDetector     |    ✅     |                  |             |         |

| **Primitives**   | **React** |
| :--------------- | :-------: |
| Alert            |    ✅     |
| Autocomplete     |    ✅     |
| Badge            |    ✅     |
| Button           |    ✅     |
| Card             |    ✅     |
| CheckboxField    |    ✅     |
| Collection       |    ✅     |
| Divider          |    ✅     |
| Expander         |    ✅     |
| Flex             |    ✅     |
| Grid             |    ✅     |
| Heading          |    ✅     |
| HighlightMatch   |    ✅     |
| Icon             |    ✅     |
| Image            |    ✅     |
| Link             |    ✅     |
| Loader           |    ✅     |
| Menu             |    ✅     |
| Pagination       |    ✅     |
| PasswordField    |    ✅     |
| PhoneNumberField |    ✅     |
| Placeholder      |    ✅     |
| RadioGroupField  |    ✅     |
| Rating           |    ✅     |
| ScrollView       |    ✅     |
| SearchField      |    ✅     |
| SelectField      |    ✅     |
| SliderField      |    ✅     |
| StepperField     |    ✅     |
| SwitchField      |    ✅     |
| Table            |    ✅     |
| Tabs             |    ✅     |
| Text             |    ✅     |
| TextAreaField    |    ✅     |
| TextField        |    ✅     |
| ToggleButton     |    ✅     |
| View             |    ✅     |
| VisuallyHidden   |    ✅     |

## Version Support

AWS Amplify UI library (React, React Native, Angular, and Vue) that depends on AWS Amplify JavaScript library v4 and below will end support on **April 13, 2026**, as documented in our [AWS Amplify UI libraries version support calendar](https://github.com/aws-amplify/amplify-ui/issues/6712).

Effective immediately, the AWS Amplify UI library that depends on AWS Amplify JavaScript library v4 and below will enter **Maintenance Mode** until April 13, 2026 after which it will receive no more updates. While in Maintenance Mode, the libraries will only receive updates for **critical bug fixes and security vulnerabilities**. Refer to [Amplify Documentation](https://docs.amplify.aws/reference/maintenance-policy) for more information on the maintenance policy.

If you are using AWS Amplify UI library that depends on AWS Amplify JavaScript library v4 and below, we strongly recommend upgrading to the latest AWS Amplify UI library before April 13, 2026.

## Frequently asked questions

**What are the major benefits of Amplify UI?**

- **Better developer experience** Connected-components like Authenticator are being written with framework-specific implementations so that they follow framework conventions and are easier to integrate into your application.
- **Endlessly customizable** Every detail of Amplify UI is customizable to match your brand. Style all of Amplify UI with themes, override components with your own, or build your own UI and use Amplify for complex state management.
- **Accessible** Amplify UI components follow [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) and [WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/) best practices and guidelines such as color contrast, keyboard navigation, accessible labels, and focus management.
- **Primitive components (React only right now)** Primitive components are used in the connected components, like Authenticator, you can also customize them and use them to build the rest of your UI.

**How does this compare to other UI libraries like Tailwind, Chakra, Supabase, or Material-UI?**

Amplify UI consists of both primitive components like Buttons, Badges, and Cards, as well as cloud-connected and data-bound components like the Authenticator. We are taking heavy inspiration from open-source frameworks like [Tailwind](https://tailwindcss.com/), [Chakra](https://chakra-ui.com/), [Supabase](https://ui.supabase.io/), [Radix](https://www.radix-ui.com/), [Adobe Spectrum](https://react-spectrum.adobe.com/), [Material-UI](https://material-ui.com/), and others. In fact, one of the core ideas with the new Amplify UI is the ability to integrate seamlessly into _any_ application, including ones using those UI frameworks. For example, you can use Tailwind classes to style Amplify UI components or Chakra components like buttons inside Amplify connected-components like the Authenticator.

**Where should I file bugs and requests?**

[Bugs and feature requests for this fork](https://github.com/saasontools/amplify-ui/issues/new)

You can also use the above link to report a bug or a feature request for previous version of Amplify UI Components.

As we continue to work on the new Amplify UI we will move UI-related issues in the amplify-js repository over here to work on them. We will continue to maintain major bug and security fixes for all existing UI packages and versions. New development for UI components will happen in this repository and eventually be published under the `@react` npm tag.

## We love contributors!!

See our contributing guide [CONTRIBUTING.md](/CONTRIBUTING.md) to help us scale Amplify UI!

---

## License Note

Although this repository is released and licensed under the Apache License (see [LICENSE](./LICENSE)), devDependencies of some packages (namely: [docs](./docs), the [next-example](./examples/next) as well as the [next-app-router example](./examples/next-app-router)) transitively use the third party [sharp](https://sharp.pixelplumbing.com/) project through NEXT.js

The sharp projects prebuilt binaries' licensing includes [LGPL-2.1](https://opensource.org/license/LGPL-2.1) and [LGPL-3.0-or-later](https://opensource.org/license/LGPL-3.0) licenses
