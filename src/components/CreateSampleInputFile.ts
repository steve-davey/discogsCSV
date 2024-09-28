export default {
  name: 'CreateSampleInputFile',
  methods: {
    createSampleInputFile
  }
}

export function createSampleInputFile() {
  const createRandomArray = function () {
    const randomArray: number[] = Array(10)
      .fill(0)
      .map(() => Math.floor(Math.random() * 1000))
    return randomArray
  }

  const createCsv = function (randomArray: any[]) {
    Object.values(randomArray).join(',')
    return randomArray.join('\n')
  }

  const download = (randomArray: any) => {
    const blob = new Blob([randomArray], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'download.csv'
    a.click()
  }

  const csvdata = createCsv(createRandomArray())
  download(csvdata)
}
