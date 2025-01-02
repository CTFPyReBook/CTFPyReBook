'''

此脚本适用于realse而不适用于Debug!!!!!!!!


并且这个脚本不完全准确，可能出现错位，无法导入等多种问题，请检查后再导入变量！！！

这个小脚本闲来无事搓的，没有进行优化完善，如果各位师傅有更好的思路或是修改方法，欢迎提交issue

'''
import ida_typeinf
import idautils

def find_str_xrefs_simple(search_str):
    ea = 0
    # 搜索字符串
    while True:
        ea = ida_search.find_text(ea, 0, 0, search_str, ida_search.SEARCH_DOWN)
        print(f"\n找到字符串地址: {hex(ea)}")
        # 获取交叉引用
        for xref in idautils.XrefsTo(ea, 0):
            print(f"被引用地址: {hex(xref.frm)}")
            return xref.frm
        ea +=1

def rename_function_at_address(address, new_name):
    # 获取函数起始地址
    func = ida_funcs.get_func(address)
    if not func:
        print(f"地址 {hex(address)} 不在任何函数中")
        return False

    # 获取当前函数名称
    current_name = idc.get_func_name(func.start_ea)
    print(f"当前函数名称: {current_name}")

    # 尝试重命名函数
    if idc.set_name(func.start_ea, new_name):
        print(f"函数 {current_name} 已重命名为 {new_name}")
        return True
    else:
        print(f"无法重命名函数 {current_name} 为 {new_name}")
        return False


def get_function_name_at_address(address):
    # 获取函数起始地址
    func = ida_funcs.get_func(address)
    if not func:
        return None

    # 获取函数名称
    func_name = idc.get_func_name(func.start_ea)
    return func_name

def get_function_address_by_name(func_name):
    # 获取函数的起始地址
    func_ea = idc.get_name_ea_simple(func_name)
    if func_ea == idc.BADADDR:
        print(f"未找到函数: {func_name}")
        return None
    else:
        print(f"函数 {func_name} 的地址是: {hex(func_ea)}")
        return func_ea

# 使用示例

def add_struct_from_c(struct_str):
    # 解析C代码
    til = ida_typeinf.get_idati()  # 获取当前类型库

    # 尝试解析并添加类型
    result = ida_typeinf.parse_decls(til, struct_str, None, 0)
    print("成功添加结构体定义")
    return result


def print_strings_in_function(func_addr):
    string_list = []
    # 获取函数对象
    func = ida_funcs.get_func(func_addr)
    if not func:
        print("未找到指定地址的函数")
        return

    # 遍历函数中的每个指令
    curr_addr = func.start_ea
    while curr_addr < func.end_ea:
        # 获取当前指令的操作数
        for i in range(2):  # 检查两个操作数
            opnd_type = idc.get_operand_type(curr_addr, i)

            # 检查是否是偏移量类型（可能指向字符串）
            if opnd_type == idc.o_imm or opnd_type == idc.o_mem:
                possible_str = idc.get_operand_value(curr_addr, i)

                # 尝试读取字符串
                string = ida_bytes.get_strlit_contents(possible_str, -1, ida_nalt.STRTYPE_C)
                if string:
                    words = string.decode('utf-8', errors='ignore')
                    # if str(words[0]).isdigit():
                    #     continue
                    if not str(words).isprintable():
                        continue
                    for letter in words:

                        if (not str(letter).isdigit()) and (not str(letter).isalpha()) and (letter != '_'):
                            words = words.replace(letter,"_"+str(ord(letter))+"_")
                    print(f"地址 0x{curr_addr:x} 处发现字符串: {words}")
                    while words in string_list:
                        words += "_repe"
                    string_list.append(words)

        # 移动到下一条指令
        curr_addr = idc.next_head(curr_addr)
    return string_list


# 使用示例
if __name__ == '__main__':
    # 结构体定义
    struct_str = """
    struct __pyx_mstate_global {
    PyObject *__pyx_d;
    PyObject *__pyx_b;
    PyObject *__pyx_cython_runtime;
    PyObject *__pyx_empty_tuple;
    PyObject *__pyx_empty_bytes;
    PyObject *__pyx_empty_unicode;
    PyTypeObject *__pyx_CyFunctionType;
    """

    mstate = '''
    struct mstate{
        struct __pyx_mstate_global *_;
    }
    '''
    search_str = "__main__"
    # 使用示例
    address = find_str_xrefs_simple(search_str)
    function_name = get_function_name_at_address(address)
    # 使用示例
    address = get_function_address_by_name(function_name)  # 替换为你要重命名的函数地址
    new_function_name = "PyX_CreateStringTabAndInitStrings"  # 替换为新的函数名称
    rename_function_at_address(address, new_function_name)
    print("以找到对应关键函数并命名")

    string_list = print_strings_in_function(address)
    for i in string_list:
        struct_str += "PyObject* _{};\n".format(i)
    struct_str += "};"

    print(struct_str)

    # 添加结构体
    add_struct_from_c(struct_str)
    add_struct_from_c(mstate)