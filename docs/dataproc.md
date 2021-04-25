# How to use Dataproc to run data cleaning and clustering algorithms?

## Dataproc python package installation

We're using nltk package, need to install it in each VM in DataProc cluster.
It's easily be done in initialization process.

[Google Dataproc python Install](https://cloud.google.com/dataproc/docs/tutorials/python-configuration)

```bash
REGION=us-west1
CLUSTER_NAME=podcast-007
gcloud dataproc clusters create ${CLUSTER_NAME} \
	--image-version=2.0-ubuntu18 \
	--optional-components=JUPYTER \
    --region ${REGION} \
	--enable-component-gateway \
    --metadata 'CONDA_PACKAGES=nltk scikit-learn pandas' \
    --initialization-actions gs://goog-dataproc-initialization-actions-${REGION}/python/pip-install.sh
```

[Dataproc VM default Python](https://cloud.google.com/dataproc/docs/tutorials/python-configuration#choosing_a_python_interpreter_for_a_job)



More References:
[Google Dataproc python packages installation github](https://github.com/GoogleCloudDataproc/initialization-actions/tree/master/python)

## Write pyspark jobs
[How to write pyspark job with Cloud Storage: Use the Cloud Storage connector with Apache Spark](https://cloud.google.com/dataproc/docs/tutorials/gcs-connector-spark-tutorial#python)

[How to write pyspark job](https://developerzen.com/best-practices-writing-production-grade-pyspark-jobs-cb688ac4d20f)

[How to solve NTLK missing package issues in DataProc](https://lab.astamuse.co.jp/entry/2020/04/08/113000)