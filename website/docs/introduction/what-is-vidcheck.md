---
sidebar_position: 1
---

# What is VidCheck?

<!-- ## What is VidCheck? -->

VidCheck is a web platform that makes video fact-checking more standardized for fact-checkers, easy to read and understand for audiences, and scalable for platforms & fact-checkers. VidCheck can be used in cases where claims being fact-checked are part of the video such as political speeches, news content, documentaries, any other type of commentary, manipulated content, etc.

The current model of fact-checking claims in videos is to pick specific parts of the video where claims are seen or where manipulations are made and fact-check them. Usually, fact-checkers use timestamps in their article to identify the claims/manipulations if it's a longer video. They then fact-check the identified claims. This process has certain drawbacks such as fact-checkers going through lengthy videos to identify claims, audiences opening the video, and navigating to specific parts of the video.

VidCheck aims to solve these issues and present a refreshingly new & intuitive UI for these types of fact-checks. 

## How does it benefit Fact-Checkers?

Fact-checkers need to identify the timestamps (from & to) where claims are made in the video that is to be fact-checked. They enter these timelines in VidCheck and the specific claim being made at that specific time. VidCheck then enables them to write their research, fact-check for these claims. In the case of manipulated videos or out-of-context videos, fact-checkers will identify & enter the time frames used for the purpose of evidence or clues. The relevant clip or the GIF will automatically be a part of the fact-check without having to manually embed or take screenshots. We also plan to integrate all this into the original videos so that reading the fact-check becomes a seamless exercise. Claim Review schema is populated automatically for published fact checks.

## How does it benefit Audience?

For the audience, this will be a completely new & refreshing experience. If it's a political speech, especially the ones made during election campaigns, the reader will be able to watch the specific clip where the claim is made, read the claim, and the fact-check, all at one place without having to go back & forth in the video. The audiences can read the fact-check claim by claim where they can watch the clip, read the fact-check in a refreshingly new UI. They don't need to watch lengthy videos just to see where the claim is made. In the case of manipulated or out-of-context videos, the audience can watch the clip where relevant evidence or clues are identified by the fact-checker. They can also watch GIFs generated with the identified evidence or clue used for fact-checking. Audience can jump to a certain claim in the video by clicking through the list of claims & also get a graphical view of all the ratings for the claims. Readers can also send URLs to the videos to fact-checkers specifying the timings of the claims they would like to fact-check. Fact-checkers will receive the submissions in their queue and can choose to publish a fact check for the same.

## How does it benefit Platforms? 

VidCheck solves an important problem for platforms as far as misinformation with videos is concerned. It is immensely useful for a platform like YouTube because all the information entered in VidCheck is exposed as an API which can be used to add additional context and information in the videos presented on the platform.

All in all, VidCheck makes this entire process a part of the fact-checking workflow. Hence without any additional efforts, the entire ecosystem will benefit.

## How is the project funded?

VidCheck is one of the projects started at Factly Media Lab as a part of its initiatives under Journalism Technology. VidCheck was one of the [winners](https://www.poynter.org/fact-checking/2020/the-fact-checking-development-grant-has-awarded-22-projects-in-12-countries-meet-the-grant-winners/) for IFCN's [Fact-Checking Development Grant Program](https://www.poynter.org/devgrant/) and was funded early on by this grant.

Similar to all our open source projects at Factly, we plan to sustain VidCheck's development through an internal development team in collaboration with the open source community. While we have a [free open source version](/docs/introduction/self-hosted) of VidCheck available for anyone to self-host, we will also run a [managed service](/docs/introduction/managed-service) for a subscription fee for organizations/users that do not have the resources to deploy and manage VidCheck on their own.