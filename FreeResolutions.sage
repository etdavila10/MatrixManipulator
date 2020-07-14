import re
from collections import Counter
import datetime

class FreeResolution:
    def __init__(self, gens, length_limit=5):
        length_limit += 2
        self.length_limit = length_limit
        self.gens = tuple(gens)
        # At some point maybe make sure this is in the Semigroup Algebra
        R.<x> = PolynomialRing(QQ)

        # Number of generators
        num_gens = len(self.gens)

        # Setup list of gens for M2
        N = 'N = {{%d}'
        N += ''.join([',{%d}' for _ in range(num_gens-1)])
        N += '}'

        # Make sure all variables we are going to use aren't being used
        macaulay2.clear('x')
        macaulay2.clear('t')

        # List of generators
        macaulay2.eval(N % self.gens)

        # Polynomial Ring
        macaulay2.eval('Q = QQ[x_1..x_(#N), MonomialOrder => Lex, Degrees => N]')
        macaulay2.eval('T = QQ[t_1..t_(#(first N))]')
        macaulay2.eval('phi = map(T, Q, matrix {apply(N, n -> T_n)})')

        # Semigroup Algebra
        macaulay2.eval('I = ideal(Q/(ker phi))')
        macaulay2.eval('R = Q/I')

        # Maximal Ideal
        macaulay2.eval('J = ideal(vars(R))')

        # Free Resolution for Maximal Ideal
        macaulay2.eval('C = resolution(J, LengthLimit => %d)' % length_limit)

        # Regular Expression to find the non-zero values
        raw_string = r'^(-)?(\d+)?x_(\d+)\^?(\d+)?'
        raw_string += r'(x_(\d+)\^?(\d+)?)?' * (num_gens - 1)
        raw_string += r'$'
        nonzero_vals = re.compile(raw_string)

        # Regular Expression to find the graded degrees
        graded_deg = re.compile(r'\{\d+\}')

        # Return entire free resolution up to length_limit
        output_matrices = [matrix([])]
        graded_degrees = []
        ungraded_degrees = []
        for i in range(1, self.length_limit):
            raw_string = macaulay2.eval('C.dd_%d' % i)
            raw_list = raw_string.split('\n')
            output_matrix = []
            cur_graded_deg = []
            for j, item in enumerate(raw_list):
                if '|' in item:
                    output_row = []
                    row = item.split()
                    for k, item in enumerate(row):
                        if item[0] == '{':
                            cur_graded_deg.append(int(item[1:-1]))
                        if item == '0':
                            output_row.append(0)
                        elif re.match(nonzero_vals, item) is not None:
                            converted = nonzero_vals.sub(self.__convert, item)
                            # value =-x^int(converted[1:]) if item[0] == '-' \
                            #     else x^int(converted)
                            output_row.append(R(converted))
                    output_matrix.append(output_row)
            graded_degrees.append(matrix(cur_graded_deg).transpose())
            ungraded_degrees.append(len(cur_graded_deg))
            output_matrices.append(matrix(output_matrix))
        self.matrices = output_matrices[:-1]
        self.graded_degrees = graded_degrees
        self.ungraded_degrees = ungraded_degrees
        spacing_res = 6
        spacing_ungraded = 10
        spacing_graded = 9
        output_string = ' ' * 4
        for i in range(1, len(self.ungraded_degrees)):
            output_string += 'M_%d' % i
            output_string += ' ' * spacing_ungraded
        print(output_string)
        output_string = 'I'

        for i in range(1, len(self.ungraded_degrees)):
            output_string += ' <---- '
            cur = 'R^%d' % self.ungraded_degrees[i]
            output_string += cur.center(spacing_res, ' ')
        print(output_string)

    def __convert(self, match):
        total_power = 0
        negative = match.group(1) if match.group(1) is not None else ''
        coeff = match.group(2) if match.group(2) is not None else ''

        for i in range(len(self.gens)):
            if match.group(3 * i + 2) is not None or i == 0:
                gen = int(match.group(3 * i + 3))
                power = int(match.group(3 * i + 4)) if match.group(3 * i + 4) is not None else 1
                total_power += self.gens[gen-1] * power

        return '%s%sx^%d' % (negative, coeff, total_power)

    # In permutation notation
    # for example passing in (1, 3, 2)
    # makes row 1 go to row 3, row 3 goes to row 2
    # and row 2 goes to row 1
    def permute_rows(self, swaps, mat):
        # Matrix manipulation
        if mat < 1 or mat > self.length_limit-2:
            print('please try another matrix')
            return
        M = self.matrices[mat]
        G = PermutationGroup([str(swaps)])
        sigma = G.gens()[0]
        M.permute_rows(sigma)
        if mat != 1:
            M_graded_degs = self.graded_degrees[mat-1]
            M_graded_degs.permute_rows(sigma)
            M_prev = self.matrices[mat - 1]
            M_prev.permute_columns(sigma)
        return


    def permute_cols(self, swaps, mat):
        if mat < 1 or mat > self.length_limit-2:
            print('please try another matrix')
        # Matrix manipulation
        M = self.matrices[mat]
        M_graded_degs = self.graded_degrees[mat]
        G = PermutationGroup([str(swaps)])
        sigma = G.gens()[0]
        M.permute_columns(sigma)
        M_graded_degs.permute_rows(sigma)
        if mat != self.length_limit-2:
            M_next = self.matrices[mat+1]
            M_next.permute_rows(sigma)
        return

    def add_multiple_of_row(self, mat, i, j, scalar=1):
        if mat < 1 or mat > self.length_limit-2:
            print('please try another matrix')
        M = self.matrices[mat]
        M.add_multiple_of_row(i, j, scalar)
        if mat != 1:
            M_prev = self.matrices[mat-1]
            M_prev.add_multiple_of_column(j, i, -1 * scalar)
        return

    def add_multiple_of_column(self, mat, i, j, scalar=1):
        if mat < 1 or mat > self.length_limit-2:
            print('please try another matrix')
        M = self.matrices[mat]
        M.add_multiple_of_column(i, j, scalar)
        if mat != self.length_limit-2:
            M_next = self.matrices[mat+1]
            M_next.add_multiple_of_row(j, i, -1 * scalar)
        return

    def scale_row_by_neg_one(self, mat, i):
        if mat < 1 or mat > self.length_limit-2:
            print('please try another matrix')
        M = self.matrices[mat]
        M.rescale_row(i, -1)
        if mat != 1:
            M_prev = self.matrices[mat-1]
            M_prev.rescale_col(i, -1)
        return

    def scale_col_by_neg_one(self, mat, i):
        if mat < 1 or mat > self.length_limit-2:
            print('please try another matrix')
        M = self.matrices[mat]
        M.rescale_col(i, -1)
        if mat != self.length_limit-2:
            M_next = self.matrices[mat+1]
            M_next.rescale_row(i, -1)
        return

    def betti_tally(self):
        entire_dict = {0:dict()}
        for i in range(1, self.length_limit - 1):
            entire_dict.setdefault(i, dict(Counter(self.graded_degrees[i].column(0))))
        return entire_dict

    def manipulator_file(self, filename = None):
        if filename is None:
            filename = 'matrixmanipulator-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S') + '.txt'
        
        lines = []
        
        print(self.graded_degrees)
        print(self.matrices)
        
        S = NumericalSemigroup(self.gens)
        gaplist = [i for i in [1 .. S.FrobeniusNumber()] if i not in S]
        lines.append(' '.join([str(i) for i in gaplist]))
        lines.append('')
        
        for i in range(1,len(self.matrices)):
            M = self.matrices[i]
            G = self.graded_degrees[i-1]
            G2 = self.graded_degrees[i]
            
            lines.append(str(M.nrows()) + ' ' + str(M.ncols()))
            
            if G.nrows() == 0:
                lines.append('0')
            else:
                lines.append(' '.join([str(d[0]) for d in G.rows()]))

            if G2.nrows() == 0:
                lines.append('0')
            else:
                lines.append(' '.join([str(d[0]) for d in G2.rows()]))
            
            lines.append('')
            
            for row in M.rows():
                lines.append(' '.join([str(entry) for entry in row]))
            
            lines.append('')
        
        with open(filename, "w") as f:
            f.write("\n".join(lines))

    def print_resolution(self):
        spacing_res = 6
        spacing_ungraded = 10
        spacing_graded = 9
        output_string = ' ' * 4
        for i in range(1, len(self.ungraded_degrees)):
            output_string += 'M_%d' % i
            output_string += ' ' * spacing_ungraded
        print(output_string)
        output_string = 'I'

        for i in range(1, len(self.ungraded_degrees)):
            output_string += ' <---- '
            cur = 'R^%d' % self.ungraded_degrees[i]
            output_string += cur.center(spacing_res, ' ')
        print(output_string)

        max_deg = 0
        for i in range(1, len(self.graded_degrees)):
            if max_deg < self.graded_degrees[i].nrows():
                max_deg = self.graded_degrees[i].nrows()

        output_string = ''
        for cur_deg in range(max_deg):
            output_row = ' ' * 7
            for cur_col in range(1, len(self.graded_degrees)):
                if self.graded_degrees[cur_col].nrows() < cur_deg+1:
                    output_row += ''.rjust(4, ' ')
                    output_row += ' ' * spacing_graded
                else:
                    cur = '%d' % self.graded_degrees[cur_col].row(cur_deg)[0]
                    output_row += cur.rjust(4, ' ')
                    output_row += ' ' * spacing_graded
            output_row += '\n'
            output_string += output_row
        print(output_string)

        for i in range(1, len(self.matrices)):
            if i == 1:
                print('M_%d' % i)
                print(self.matrices[i])
                print()
                print('I <---- R^%d' % self.matrices[i].ncols())
            else:
                print('M_%d' % i)
                print(self.matrices[i])
                print()
                print('R^%d <---- R^%d' % (self.matrices[i-1].ncols(), self.matrices[i].ncols()))
            print('-' * 80)
            print()

    def __repr__(self):
        return "This is a Free Resolution Chain Complex"
