import Image from 'next/image'
import { motion } from 'framer-motion'

const partners = [
  {
    id: 1,
    name: "Partner 1",
    logo: "/partners/partner1.png"
  },
  {
    id: 2,
    name: "Partner 2",
    logo: "/partners/partner2.png"
  },
  {
    id: 3,
    name: "Partner 3",
    logo: "/partners/partner3.png"
  }
];

const clients = [
  {
    id: 1,
    name: "Client 1",
    logo: "/clients/client1.png"
  },
  {
    id: 2,
    name: "Client 2",
    logo: "/clients/client2.png"
  },
  {
    id: 3,
    name: "Client 3",
    logo: "/clients/client3.png"
  }
];

export default function Partners() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Partners Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Đối tác
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Chúng tôi hợp tác với các nhà cung cấp hàng đầu để đảm bảo chất lượng trải nghiệm tốt nhất
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative w-full h-20">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Clients Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Khách hàng
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Fitfood tự hào là lựa chọn ưu tiên hàng đầu của các doanh nghiệp lớn trong và ngoài nước
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {clients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative w-full h-20">
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              (Click vào logo để xem hình ảnh thực tế sự kiện)
            </p>
            <p className="text-gray-600">
              Liên hệ <a href="mailto:business@fitfood.vn" className="text-green-600 hover:text-green-700">business@fitfood.vn</a> để đặt tiệc ngay
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 