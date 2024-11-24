<h1 align="center">
Teatime
</h1>

<p align="center">
Teatime is a fully static distributed library system powered by IPFS, SQLite, and GitHub
</p>
<p align="center">
<img src="https://github.com/user-attachments/assets/caacdcde-8ad9-49af-915f-c93a52c7bf11" height="300"> <br/>
Auto-updating instances are hosted on <a href="https://teatime-library.netlify.app/">Netlify</a> and <a href="https://bjesus.github.io/teatime/">GitHub Pages</a>. See <a href="https://github.com/bjesus/teatime/wiki/Public-instances">Public Instances</a> for more.
</p>

# A Distributed Library

The Teatime web application is completely decoupled from its databases and the files it fetches. The databases used in Teatime are [GitHub repositories tagged with the teatime-database topic](https://github.com/search?q=topic%3Ateatime-database&type=repositories), which are published on GitHub Pages. Each repository contains a [config.json](https://github.com/bjesus/teatime-database/blob/main/config.json) file that points to an SQLite database. Before a user performs a search in Teatime, they choose which database to use and then Teatime queries the SQLite database using [sql.js-httpvfs](https://github.com/phiresky/sql.js-httpvfs). Each row in the SQLite database is an item in the library, and a file hash column is used for getting the item from IPFS.

Since the web application is a static site, and the databases are comprised of static files, both can be easily forked, replicated, and deployed. With the files being served off IPFS, this distributed architecture contributes to Teatime's resilience.

## Developing the Frontend

Teatime is Nuxt.js application. You can easily run it locally by cloning the repository and following these steps:

1. Install the dependencies: `npm install`
2. Run the server: `npm run dev`
3. Navigate to `http://localhost:3000`

Check out the [Nuxt documentation](https://nuxt.com/docs/getting-started) for more information.

## Creating a Database

> [!TIP]
> The easiest way to create your own database is by forking the [JSON-based database repository](https://github.com/bjesus/teatime-json-database/) and adjusting the JSON files according to your needs. GitHub Actions will then generate an SQLite file and upload it to GitHub Pages.

To manually generate an SQLite database that Teatime can work with, follow the example on [the database repository](https://github.com/bjesus/teatime-database/).

Each SQLite database contains a table with the below schema. Note that column names can be adjusted in the `config.json` file.

```sql
CREATE TABLE "books" (
 "id" INTEGER,
 "title" TEXT,
 "author" TEXT,
 "year" INTEGER,
 "lang" TEXT,
 "size" INTEGER,
 "ext" TEXT,
 "ipfs_cid" TEXT,
 PRIMARY KEY("id" AUTOINCREMENT)
);
```

The `dbConfig` section of `config.json` is identical to the output of the [sql.js-httpvfs create_db.sh](https://github.com/phiresky/sql.js-httpvfs/blob/master/create_db.sh) script.

If the SQLite file is too big, you can [split it](https://github.com/phiresky/sql.js-httpvfs?tab=readme-ov-file#usage). Note the information about optimizing your database. You will also want to [use FTS](https://github.com/bjesus/teatime-database/blob/main/create_indexes.sql). Then, publish your repository to GitHub Pages and assign the `teatime-database` topic to your repository.

## Contributing

Even if you cannot code, a great way to contribute is to simply fork this repository, as well as your favorite database repositories. If you fork the repository, it could be better to do it manually (`git clone` && `git remote add your-origin ...` && `git push your-origin main`) so that the repositories won't be directly linked.

It's also useful to star the databases repositories you find useful, as this determines their order in the Teatime user interface, making it easier for other users to find the best databases.
