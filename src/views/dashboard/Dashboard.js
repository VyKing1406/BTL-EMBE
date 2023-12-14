/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, Fragment } from 'react'
import {
  CCardFooter,
  CCardHeader,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CFormInput,
} from '@coreui/react'
import { DatePicker, Space } from 'antd'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import axios from 'axios'
import mqtt from 'mqtt'

const options = {
  protocol: 'ws',
  username: 'ahihi',
  password: 'aio_bppf47tF4AX8gv1REfgyIFxrZTFh',
  keepalive: 20,
  // clientId uniquely identifies client
  // choose any string you wish
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
}
const client = mqtt.connect('ws://io.adafruit.com:443', options)

client.subscribe('ahihi/feeds/temperature')
client.subscribe('ahihi/feeds/soilMoisture')
client.subscribe('ahihi/feeds/humidity')
client.subscribe('ahihi/feeds/pump')
client.subscribe('ahihi/feeds/control')

const Dashboard = () => {
  const apiKey = 'aio_bppf47tF4AX8gv1REfgyIFxrZTFh'
  var note

  // Sets default React state
  const [currentTemp, setTemp] = useState(
    <Fragment>
      <em>...</em>
    </Fragment>,
  )
  const [currentHumi, setHumi] = useState(
    <Fragment>
      <em>...</em>
    </Fragment>,
  )
  const [currentSoil, setSoil] = useState(
    <Fragment>
      <em>...</em>
    </Fragment>,
  )

  const [tempD, setTempD] = useState([])
  const [soilD, setSoilD] = useState([])
  const [humiD, setHumiD] = useState([])
  const [isPumpOn, setIsPumpOn] = useState()
  client.on('message', function (topic, message) {
    note = message.toString()
    // Updates React state with message
    if (topic === 'ahihi/feeds/pump') {
      setIsPumpOn(Number(note))
    } else {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1 // Tháng tính từ 0 đến 11, nên cần cộng thêm 1
      const day = currentDate.getDate()
      const nowDate = `${day}/${month}/${year}`
      const newDate = {
        created_at: nowDate,
        value: note,
      }
      if (topic === 'ahihi/feeds/temperature') {
        setTemp(note)
        setTempD((prev) => {
          const newTempD = [...prev.slice(1), newDate]
          return newTempD
        })
      }
      if (topic === 'ahihi/feeds/soilMoisture') {
        setSoil(note)
        setSoilD((prev) => {
          const newTempD = [...prev.slice(1), newDate]
          return newTempD
        })
      }
      if (topic === 'ahihi/feeds/humidity') {
        setHumi(note)
        setHumiD((prev) => {
          const newTempD = [...prev.slice(1), newDate]
          return newTempD
        })
      }
      if (topic === 'ahihi/feeds/control') {
        setIsPumpOn(note)
        setHumiD((prev) => {
          const newTempD = [...prev.slice(1), newDate]
          return newTempD
        })
      }
    }
  })
  const fetchData = (url, receiver, topic) => {
    // Gọi API và nhận dữ liệu
    // Ví dụ sử dụng axios
    axios
      .get(url, {
        headers: {
          'X-AIO-Key': apiKey,
        },
      })
      .then((response) => {
        if (topic === 'temp') {
          setTemp(response.data[0]?.value)
        }
        if (topic === 'soil') {
          setSoil(response.data[0]?.value)
        }
        if (topic === 'humi') {
          setHumi(response.data[0]?.value)
        }
        if (topic === 'pump') {
          setIsPumpOn(Number(response.data[0]?.value))
        }
        receiver(response.data.reverse())
      })
      .catch((error) => {
        console.error(error)
      })
  }
  const publish = (topic, payload) => {
    client.publish(topic, payload, (err) => {
      if (err) {
        console.error('Publish error:', err)
      } else {
        console.log(`Sent data to ${topic}:`, payload)
      }
    })
  }

  useEffect(() => {
    fetchData('https://io.adafruit.com/api/v2/ahihi/feeds/temperature/data', setTempD, 'temp')
    fetchData('https://io.adafruit.com/api/v2/ahihi/feeds/soilmoisture/data', setSoilD, 'soil')
    fetchData('https://io.adafruit.com/api/v2/ahihi/feeds/humidity/data', setHumiD, 'humi')
    fetchData('https://io.adafruit.com/api/v2/ahihi/feeds/pump/data', setIsPumpOn, 'pump')
  }, [])

  const date = new Date()

  const [input1, setInput1] = useState('')
  const [input3, setInput3] = useState('')
  const [activeInterval, setActiveInterval] = useState('')

  const handleInputChange1 = (e) => {
    setInput1(e.target.value)
  }

  const handleInputChange3 = (e) => {
    setInput3(e.target.value)
  }

  const handleChangePumpControl = () => {
    setIsPumpOn((pre) => {
      publish('ahihi/feeds/control', `pump ${pre ? 0 : 1}`)
      return pre ? 0 : 1
    })
  }

  const handleSubmit = (device, e) => {
    e.preventDefault()
    if (device === 'pump') {
      const dataToSend = `time ${activeInterval} ${input1}`
      console.log(activeInterval)
      setInput1('')
      publish('ahihi/feeds/control', dataToSend)
    } else {
      setInput3('')
      const dataToSend = `${device} ${input3}`
      publish('ahihi/feeds/control', dataToSend)
    }
  }
  const onChange = (value, dateString) => {
    setActiveInterval(dateString)
  }
  //display state pumb
  return (
    <>
      <h3>Pump control</h3>
      <CRow>
        <CCol sm="12">
          <CCard>
            <CCardBody color={isPumpOn ? 'danger' : 'success'}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ margin: 10 }}>Pump is</p>
                <CButton color="primary" onClick={handleChangePumpControl}>
                  {isPumpOn === 1 ? 'on' : 'off'}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CForm
        className="row row-cols-lg-auto g-3 align-items-center"
        style={{ paddingBottom: '20px', paddingTop: '20px' }}
      >
        <p>Set timer to active pump</p>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CCardBody>
            <CCol xs={12}>
              <Space direction="vertical" size={12}>
                <DatePicker showTime onChange={onChange} format="DD/MM/YYYY-HH:mm:ss" />
              </Space>
            </CCol>

            <CCol xs={12}>
              <CFormLabel
                className="visually-hidden"
                htmlFor="inlineFormInputGroupUsername"
              ></CFormLabel>
              <CInputGroup>
                <CFormInput
                  id="inlineFormInputGroupUsername"
                  placeholder="Active"
                  value={input1}
                  onChange={handleInputChange1}
                />
              </CInputGroup>
            </CCol>

            <CCol xs={12}>
              <CButton type="submit" onClick={(e) => handleSubmit('pump', e)}>
                Submit
              </CButton>
            </CCol>
          </CCardBody>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CCardBody>
            <CCol xs={12}>
              <CFormLabel className="visually-hidden" htmlFor="inlineFormInputGroupUsername">
                Humi when pump auto active
              </CFormLabel>
              <CInputGroup>
                <CFormInput
                  id="inlineFormInputGroupUsername"
                  placeholder="Humi when pump auto active"
                  value={input3}
                  onChange={handleInputChange3}
                />
              </CInputGroup>
            </CCol>

            <CCol xs={12}>
              <CButton type="submit" onClick={(e) => handleSubmit('soil', e)}>
                Submit
              </CButton>
            </CCol>
          </CCardBody>
        </div>
      </CForm>
      <CCard className="mb-4" key={0}>
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                {tempD[0]?.feed_key} {currentTemp}
              </h4>
              <div className="small text-medium-emphasis">{date.toString().substring(0, 10)}</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '300px', marginTop: '40px' }}
            data={{
              labels: tempD?.map((temp) => {
                return temp.created_at.substring(0, 10)
              }),
              datasets: [
                {
                  label: 'Temperature',
                  backgroundColor: hexToRgba(getStyle('--cui-info'), 10),
                  borderColor: getStyle('--cui-info'),
                  pointHoverBackgroundColor: getStyle('--cui-info'),
                  borderWidth: 2,
                  data: tempD?.map((temp) => {
                    return temp.value
                  }),
                  fill: true,
                },
              ],
            }}
            options={{
              animation: false,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    drawOnChartArea: false,
                  },
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 20,
                    stepSize: Math.ceil(250 / 5),
                    max: 250,
                  },
                },
                y: {
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 10,
                    stepSize: Math.ceil(5),
                    max: 120,
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 4,
                  hoverBorderWidth: 3,
                },
              },
            }}
          />
        </CCardBody>
      </CCard>

      <CCard className="mb-4" key={1}>
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                {humiD[0]?.feed_key} {currentHumi}
              </h4>
              <div className="small text-medium-emphasis">{date.toString().substring(0, 10)}</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '300px', marginTop: '40px' }}
            data={{
              labels: humiD.map((temp) => {
                return temp.created_at.substring(0, 10)
              }),
              datasets: [
                {
                  label: 'Temperature',
                  backgroundColor: hexToRgba(getStyle('--cui-info'), 10),
                  borderColor: getStyle('--cui-info'),
                  pointHoverBackgroundColor: getStyle('--cui-info'),
                  borderWidth: 2,
                  data: humiD.map((temp) => {
                    return temp.value
                  }),
                  fill: true,
                },
              ],
            }}
            options={{
              animation: false,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    drawOnChartArea: false,
                  },
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 20,
                    stepSize: Math.ceil(250 / 5),
                    max: 250,
                  },
                },
                y: {
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 10,
                    stepSize: Math.ceil(5),
                    max: 120,
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 4,
                  hoverBorderWidth: 3,
                },
              },
            }}
          />
        </CCardBody>
      </CCard>

      <CCard className="mb-4" key={2}>
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                {soilD[0]?.feed_key} {currentSoil}
              </h4>
              <div className="small text-medium-emphasis">{date.toString().substring(0, 10)}</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '300px', marginTop: '40px' }}
            data={{
              labels: soilD.map((temp) => {
                return temp.created_at.substring(0, 10)
              }),
              datasets: [
                {
                  label: 'Temperature',
                  backgroundColor: hexToRgba(getStyle('--cui-info'), 10),
                  borderColor: getStyle('--cui-info'),
                  pointHoverBackgroundColor: getStyle('--cui-info'),
                  borderWidth: 2,
                  data: soilD.map((temp) => {
                    return temp.value
                  }),
                  fill: true,
                },
              ],
            }}
            options={{
              animation: false,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  grid: {
                    drawOnChartArea: false,
                  },
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 20,
                    stepSize: Math.ceil(250 / 5),
                    max: 250,
                  },
                },
                y: {
                  ticks: {
                    beginAtZero: true,
                    maxTicksLimit: 10,
                    stepSize: Math.ceil(5),
                    max: 120,
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 4,
                  hoverBorderWidth: 3,
                },
              },
            }}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard
