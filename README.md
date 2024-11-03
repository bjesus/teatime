<h1 align="center">
Teatime
</h1>

<p align="center">
Teatime is a fully static distributed library system powered by IPFS, SQLite and GitHub
</p>
<p align="center">
<img src="https://github.com/user-attachments/assets/caacdcde-8ad9-49af-915f-c93a52c7bf11" height="300"> <br/>
Auto-updating instances are hosted on <a href="https://teatime-library.netlify.app/">Netlify</a> and <a href="https://bjesus.github.io/teatime/">GitHub Pages</a>
</p>

## A Distributed Library

The Teatime web application is completely decoupled from its databases and the files it fetches. The databases used in Teatime are [GitHub repositories tagged with the teatime-database topic](https://github.com/search?q=topic%3Ateatime-database&type=repositories), which are published on GitHub Pages. Each database contains a [config.json](https://github.com/bjesus/teatime-database/blob/main/config.json) file that points to an SQLite database. Before a user performs a search in Teatime, they choose which database to query and then Teatime retrieves data from the SQLite database using [sql.js-httpvfs](https://github.com/phiresky/sql.js-httpvfs). Since the web application is a static site, and the databases are comprised of static files, both can be easily forked, replicated, and deployed. The rows in the SQLite databases include a file hash, which Teatime uses to fetch the file from IPFS gateways. This distributed architecture makes Teatime's resilience.

## Creating a Database

> [!TIP]
> An example database can be found in [the database repository](https://github.com/bjesus/teatime-database/)

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

If the SQLite file is too big, you can [split it](https://github.com/phiresky/sql.js-httpvfs?tab=readme-ov-file#usage). Note the information about optimizing your database. You will also want to [use FTS](https://github.com/bjesus/teatime-database/blob/main/create_indexes.sql). Then, publish your repository to GitHub Pages and give it the `teatime-database` topic.

## Contributing

> [!NOTE]
> Even if you cannot code, a great way to contribute is to simply fork this repository, as well as your favorite database repositories.

1. Install the dependencies: `npm install`
2. Run the server: `npm run dev`
3. Navigate to `http://localhost:3000`

Check out the [Nuxt documentation](https://nuxt.com/docs/getting-started) for more information.
