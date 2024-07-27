# Batch Processing Documents with Unstructured JS SDK

This script will process all documents in a directory using the Unstructured Serverless API JavaScript SDK.

## Setup

1. Clone the repo `git clone git@github.com:Unstructured-IO/js-client-batch.git`
2. Install dependencies `npm i`
3. Set environment variables in `.env`

```
UNSTRUCTURED_API_URL=https://api.unstructuredapp.io || <the URL of your choice>
UNSTRUCTURED_API_KEY=<Your Unstructured API Key>
STRATEGY='fast' || 'hi_res'
SPLIT_PAGES='true' || 'false'
```

## Running

### Documents to process

By default this script looks to `./sample_data` for files to process, or you can specify the path as in `.env` as:

```
...
DOCS_PATH=full/path/to/documents
```

### Output

By default this script will output partitioned results to `./output` or you can specify the output path in `.env` as:

```
...
OUTPUT_PATH=full/path/to/output
```

### Start

To run the script `npm run start`
