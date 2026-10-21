import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Layers, Waves, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function SensorHealthTable({ sensors }) {
  const sensorList = [
    {
      id: 'mpu6050_f1',
      name: 'Floor 1 6-DoF IMU (MPU6050)',
      location: 'Floor 1 (Ground Base)',
      interface: 'I²C via PCA9548A Channel 0',
      address: '0x68 (Default)',
      type: 'Tilt / Accel / Gyro',
      icon: Layers
    },
    {
      id: 'mpu6050_f2',
      name: 'Floor 2 6-DoF IMU (MPU6050)',
      location: 'Floor 2 (Upper Story)',
      interface: 'I²C via PCA9548A Channel 1',
      address: '0x68 (Default)',
      type: 'Tilt / Accel / Gyro',
      icon: Layers
    },
    {
      id: 'vibration_f1',
      name: 'Floor 1 Piezo Vibration Module',
      location: 'Floor 1 Structural Joint',
      interface: 'ESP32 GPIO 32 (ADC / Digital)',
      address: 'N/A (Pin Interfacing)',
      type: 'Shock / Vibration',
      icon: Waves
    },
    {
      id: 'vibration_f2',
      name: 'Floor 2 Piezo Vibration Module',
      location: 'Floor 2 Structural Joint',
      interface: 'ESP32 GPIO 33 (ADC / Digital)',
      address: 'N/A (Pin Interfacing)',
      type: 'Shock / Vibration',
      icon: Waves
    },
    {
      id: 'crack_sensor',
      name: 'Surface Crack Detector Expansion',
      location: 'Floor 1 / Floor 2 Shear Wall',
      interface: 'ESP32 GPIO 34 (Analog In)',
      address: 'N/A (Expansion Header)',
      type: 'Resistive Crack Line',
      icon: AlertOctagon
    }
  ];

  return (
    <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 shadow-md">
      <div className="pb-3 border-b border-navy-800">
        <h3 className="text-base font-bold text-white">Sensor Hardware Health & Bus Topology</h3>
        <p className="text-xs text-slate-400 font-mono">
          Status of individual transducer modules connected via PCA9548A multiplexer and GPIO
        </p>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-navy-900/90 text-slate-400 border-b border-navy-700">
            <tr>
              <th className="py-2.5 px-3">Transducer Module</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Interface / Pin</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Health Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/60 text-slate-300">
            {sensorList.map((sensor) => {
              const liveData = sensors?.[sensor.id] || {};
              const status = liveData.status || (sensor.id === 'crack_sensor' ? 'standby' : 'ok');
              const Icon = sensor.icon;
              return (
                <tr key={sensor.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-navy-900 text-sky-400 border border-navy-700">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{sensor.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{sensor.location}</td>
                  <td className="py-3 px-3 text-sky-300">{sensor.interface}</td>
                  <td className="py-3 px-3 text-slate-400">{sensor.type}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={status} type="health" size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
