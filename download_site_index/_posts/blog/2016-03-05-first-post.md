---
layout: blog_post
title: First Post
meta: Don't Serve Me Bro
category: blog
author: jellyjellyrobot
---

Prologue
--------

I remember being slapped with the task of managing the mirror upon my induction into NUS Hackers. Ever since then then I've always wanted to write about how this server was managed.

This server started out quite a long time ago. At that time ADSL was all the rage, and downloading packages from ubuntu.com would probably take an entire day or two. Members of then LinuxNUS got together with NUS ComCen to work on a local mirror, with mutual benefits.

For LinuxNUS, nothing brings more joy than to help the local linux community.

For NUS ComCen, let's just say that the 3 Telcommunications Companies NUS was connected to weren't particularly fond of the large bandwidth disparity between upstream and downstream accesses.

With the advances in the research conducted in NUS, there was a growing need for local research groups to share large files with people, both internally and externally.

Hence, the mirror took up a secondary role, which was to help distribute files for NUS students and, in particular, researchers.

The New Beginning
--------

Taking over operations weren't that easy.

I was given these 2 servers.

[pandan/iweb/download1](http://download1.nus.edu.sg)

[iweb2/download2/download](http://download2.nus.edu.sg)

These were Virtual Machines, with a single virtual core and 512 MB RAM. That would be cool if it weren't for the fact that the mirror was limping with Centos 5.9 and a server uptime on the order of 1000+ days (seriously, sysadmins need to rethink this matric).

404 errors plagued some of the repositories, and the server load averages went all the way to 4 **times** cores in the server. (Maximum recommended load average is 0.75 **times** cores) The networked storage volumes were in awfully sorry states, with repositories duplicated for unknown reasons and some volumes *expired a while ago*.

The large file storage solution made by my senior was the only thing that worked well on the server. Unfortunately, I'm not that good in isomorphic javascript and hip languages.

I negotiated with ComCen to upgrade the backup server - then iweb2 - to something non virtualized with a whole lot of RAM. The inspiration came from other unversity based mirrors embarking on similar [adventures](http://ftp.halifax.rwth-aachen.de).

Well, we met in the middle, and I got 8 vCores with 16GB RAM. Not too shabby but not the best setup one could hope for.

Reset and Go!
-------

Due to the archaic nature of the servers, I decided on **nuking** the entire server and starting from scratch. Mind you, I did try to upgrade from CentOS 5.9 to 7.0. It's not a good idea if you do not even have hypervisor level access.

So yup, CentOS 7 was installed onto the server, security measures added and the web, ftp and rsync servers implemented. Not long after, download.nus.edu.sg pointed to the newly instantiated (iweb2).

I then **deleted the entire repository**. Ubuntu, slackware, debian... The *whole* lot. With proper [notifications](https://lists.archlinux.org/pipermail/arch-mirrors/2015-June/000439.html) of course!

A list of repositories was compiled for each distribution, with each pull mirror tested for stablity, speed and currentness. After an exhaustive search, and quite a wait, the entire repository was rebuilt, reorganized and updated with the latest and quickest repositories.

Thanklessness
--------

Since taking the role of mirror maintainer, I've recieved an *avalanche* of critques regarding download.nus.edu.sg. I especially loathe those thinly veiled [sacarsms](https://twitter.com/kaihendry/status/683940909654753280). Thing is, this is pretty much what I can do with the limited resources I have on hand, and the bargaining power I have with ComCen.

Hopefully, the next generation of maintainers will have a better time managing this mirror.
