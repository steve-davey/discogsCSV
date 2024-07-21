export default {
  name: 'CreateSampleInputFile',
  methods: {
    createSampleInputFile
  }
}

export function createSampleInputFile() {
  const createRandomArray = function () {
    const randomArray = []
    for (let i = 0; i < 10; i++) {
      const randomNumber = Math.floor(Math.random() * 1000) + 1
      randomArray.push(randomNumber)
    }
    console.log(randomArray)
    return randomArray
  }

  const createCsv = function (randomArray: any) {
    console.log(randomArray)
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

  const get = async () => {
    const csvdata = createCsv(createRandomArray())
    download(csvdata)
  }

  const button = document.getElementById('downloadRandomSample')
  button.addEventListener('click', get)
}
