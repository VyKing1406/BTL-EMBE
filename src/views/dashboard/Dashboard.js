/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, Fragment } from 'react'

import {
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
  CFormSelect,
} from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import axios from 'axios'
import mqtt from 'mqtt'

const options = {
  protocol: 'ws',
  username: 'ahihi',
  password: 'aio_AhDx69JdiT5mcfjLTm9cCFGPRhba',
  keepalive: 20,
  // clientId uniquely identifies client
  // choose any string you wish
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
}
const client = mqtt.connect('ws://io.adafruit.com:443', options)

client.subscribe('ahihi/feeds/temperature')
client.subscribe('ahihi/feeds/soilMoisture')
client.subscribe('ahihi/feeds/humidity')

const Dashboard = () => {
  const apiKey = 'aio_AhDx69JdiT5mcfjLTm9cCFGPRhba'
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

  client.on('message', function (topic, message) {
    note = message.toString()
    // Updates React state with message
    if (topic === 'ahihi/feeds/temperature') {
      setTemp(note)
    }
    if (topic === 'ahihi/feeds/soilMoisture') {
      setSoil(note)
    }
    if (topic === 'ahihi/feeds/humidity') {
      setHumi(note)
    }
    console.log(topic)
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
  }, [currentTemp, currentHumi, currentSoil])
  const date = new Date()

  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')

  const handleInputChange1 = (e) => {
    setInput1(e.target.value)
  }

  const handleInputChange2 = (e) => {
    setInput2(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setInput1('')
    setInput2('')
    // Tạo một đối tượng dữ liệu để gửi đi
    const dataToSend = `${input1} ${input2}`

    // Gửi dữ liệu bằng Axios
    publish('ahihi/feeds/co', dataToSend)
  }

  return (
    <>
      <h3>Pump control</h3>
      <CForm
        className="row row-cols-lg-auto g-3 align-items-center"
        style={{ paddingBottom: '20px', paddingTop: '20px' }}
      >
        <CCol xs={12}>
          <CFormLabel className="visually-hidden" htmlFor="inlineFormInputGroupUsername">
            Count down
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText>@</CInputGroupText>
            <CFormInput
              id="inlineFormInputGroupUsername"
              placeholder="Count down"
              value={input1}
              onChange={handleInputChange1}
            />
          </CInputGroup>
        </CCol>

        <CCol xs={12}>
          <CFormLabel className="visually-hidden" htmlFor="inlineFormInputGroupUsername">
            Active
          </CFormLabel>
          <CInputGroup>
            <CInputGroupText>@</CInputGroupText>
            <CFormInput
              id="inlineFormInputGroupUsername"
              placeholder="Active"
              value={input2}
              onChange={handleInputChange2}
            />
          </CInputGroup>
        </CCol>

        <CCol xs={12}>
          <CButton type="submit" onClick={handleSubmit}>
            Submit
          </CButton>
        </CCol>
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
