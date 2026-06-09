export const biddingIssues = [
  {
    id: 13245,
    name: 'Nghiên cứu kỹ HSMT và BV kỹ thuật thi công',
    startDate: '2023/12/12',
    dueDate: '2023/12/12',
    assignee: 'Khanh Nguyễn',
    status: 'Hoàn thành',
    children: []
  },
  {
    id: 13246,
    name: 'Lập hồ sơ dự thầu pháp lý',
    startDate: '2023/12/12',
    dueDate: '2023/12/12',
    assignee: 'Tiến Nguyễn',
    status: 'Đang thực hiện',
    children: []
  },
  {
    id: 13247,
    name: 'Lập đơn giá dự thầu',
    startDate: '2023/12/12',
    dueDate: '2023/12/12',
    assignee: 'Nam Nguyễn',
    status: 'Đang chờ duyệt',
    children: [
      {
        id: 13248,
        name: 'Công tác bóc tách khối lượng',
        startDate: '2023/12/12',
        dueDate: '2023/12/12',
        assignee: 'Hao Anh',
        parentId: 12347,
        status: 'Đã duyệt',
        children: [
          {
            id: 13249,
            name: 'Bóc tách khối lượng cốt thép phần móng',
            startDate: '2023/12/12',
            dueDate: '2023/12/12',
            assignee: "Tính Nam",
            parentId: 12348,
            status: 'Đang chờ duyệt'
          },
          {
            id: 13250,
            name: 'Bóc tách khối lượng cốt thép phần thân',
            startDate: '2023/12/12',
            dueDate: '2023/12/12',
            assignee: null,
            parentId: 12348,
            status: 'Đang chờ duyệt'
          }
        ]
      },
    ]
  },
];