'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'

type MonHoc = {
  id: number
  ma_mon: string
  ten_mon: string
  so_tin_chi: number
}

export default function Home() {
  const [monHoc, setMonHoc] = useState<MonHoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [maMon, setMaMon] = useState('')
  const [tenMon, setTenMon] = useState('')
  const [soTinChi, setSoTinChi] = useState('3')
  const [editingId, setEditingId] = useState<number | null>(null)

  // 1. LẤY DANH SÁCH MÔN HỌC
  async function taiDanhSach() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('mon_hoc')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setMonHoc(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    taiDanhSach()
  }, [])

  // 2. THÊM HOẶC CẬP NHẬT MÔN HỌC
  async function luuMonHoc(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError('')
    setMessage('')

    if (!maMon.trim() || !tenMon.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    const duLieu = {
      ma_mon: maMon.trim(),
      ten_mon: tenMon.trim(),
      so_tin_chi: Number(soTinChi)
    }

    if (!Number.isInteger(duLieu.so_tin_chi) ||
        duLieu.so_tin_chi < 1) {
      setError('Số tín chỉ phải là số nguyên lớn hơn 0!')
      return
    }

    let result

    if (editingId !== null) {
      // CẬP NHẬT
      result = await supabase
        .from('mon_hoc')
        .update(duLieu)
        .eq('id', editingId)
    } else {
      // THÊM MỚI
      result = await supabase
        .from('mon_hoc')
        .insert([duLieu])
    }

    if (result.error) {
      setError(result.error.message)
      return
    }

    setMessage(
      editingId !== null
        ? 'Cập nhật môn học thành công!'
        : 'Thêm môn học thành công!'
    )

    lamMoiForm()
    await taiDanhSach()
  }

  // 3. CHỌN MÔN HỌC ĐỂ SỬA
  function suaMonHoc(mon: MonHoc) {
    setEditingId(mon.id)
    setMaMon(mon.ma_mon)
    setTenMon(mon.ten_mon)
    setSoTinChi(String(mon.so_tin_chi))
    setMessage('')
    setError('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // 4. XÓA MÔN HỌC
  async function xoaMonHoc(id: number) {
    const dongY = window.confirm(
      'Bạn có chắc chắn muốn xóa môn học này không?'
    )

    if (!dongY) return

    setError('')
    setMessage('')

    const { error } = await supabase
      .from('mon_hoc')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Xóa môn học thành công!')

    if (editingId === id) {
      lamMoiForm()
    }

    await taiDanhSach()
  }

  // 5. LÀM MỚI FORM
  function lamMoiForm() {
    setEditingId(null)
    setMaMon('')
    setTenMon('')
    setSoTinChi('3')
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="mx-auto max-w-6xl">

        <h1 className="mb-2 text-3xl font-bold text-blue-800">
          HỆ THỐNG QUẢN LÝ ĐÀO TẠO
        </h1>

        <p className="mb-8 text-gray-600">
          Quản lý thông tin môn học
        </p>

        {/* FORM THÊM / SỬA */}

        <section className="mb-8 rounded-xl bg-white p-6 shadow">

          <h2 className="mb-5 text-xl font-bold">
            {editingId !== null
              ? 'CẬP NHẬT MÔN HỌC'
              : 'THÊM MÔN HỌC MỚI'}
          </h2>

          <form onSubmit={luuMonHoc}>

            <div className="grid gap-4 md:grid-cols-3">

              <div>
                <label className="mb-2 block font-medium">
                  Mã môn học
                </label>

                <input
                  className="w-full rounded-lg border p-3"
                  placeholder="Ví dụ: CNTT501"
                  value={maMon}
                  onChange={(e) => setMaMon(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Tên môn học
                </label>

                <input
                  className="w-full rounded-lg border p-3"
                  placeholder="Nhập tên môn học"
                  value={tenMon}
                  onChange={(e) => setTenMon(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Số tín chỉ
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full rounded-lg border p-3"
                  value={soTinChi}
                  onChange={(e) => setSoTinChi(e.target.value)}
                  required
                />
              </div>

            </div>

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {editingId !== null
                  ? 'Cập nhật'
                  : 'Thêm môn học'}
              </button>

              <button
                type="button"
                onClick={lamMoiForm}
                className="rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white hover:bg-gray-600"
              >
                Làm mới
              </button>

            </div>

          </form>

        </section>

        {/* THÔNG BÁO */}

        {message && (
          <div className="mb-5 rounded-lg bg-green-100 p-4 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            Lỗi: {error}
          </div>
        )}

        {/* DANH SÁCH MÔN HỌC */}

        <section className="rounded-xl bg-white p-6 shadow">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              DANH SÁCH MÔN HỌC
            </h2>

            <span className="rounded-lg bg-blue-100 px-4 py-2 text-blue-800">
              Tổng: {monHoc.length} môn
            </span>
          </div>

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full border-collapse border">

                <thead className="bg-blue-100">
                  <tr>
                    <th className="border p-3">STT</th>
                    <th className="border p-3">Mã môn</th>
                    <th className="border p-3">Tên môn học</th>
                    <th className="border p-3">Số tín chỉ</th>
                    <th className="border p-3">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {monHoc.map((mon, index) => (
                    <tr
                      key={mon.id}
                      className="text-center hover:bg-gray-50"
                    >
                      <td className="border p-3">
                        {index + 1}
                      </td>

                      <td className="border p-3">
                        {mon.ma_mon}
                      </td>

                      <td className="border p-3 text-left">
                        {mon.ten_mon}
                      </td>

                      <td className="border p-3">
                        {mon.so_tin_chi}
                      </td>

                      <td className="border p-3">
                        <div className="flex flex-wrap justify-center gap-2">

                          <button
                            onClick={() => suaMonHoc(mon)}
                            className="rounded bg-yellow-500 px-3 py-2 text-white hover:bg-yellow-600"
                          >
                            Sửa
                          </button>

                          <button
                            onClick={() => xoaMonHoc(mon.id)}
                            className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                          >
                            Xóa
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}

                  {monHoc.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="border p-5 text-center"
                      >
                        Chưa có môn học nào.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

    </main>
  )
}